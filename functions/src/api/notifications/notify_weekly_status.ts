import admin = require('firebase-admin');
import axios from 'axios';

const functions = require('firebase-functions');
const dateHelper = require('../../helpers/date_helper');
const cors = require('cors')({origin: true});
const urls = require('../../strings/urls');
const translator = require('../../strings/translator');
const accountsHelper = require('../../helpers/accounts_helper');
const notificationHelper = require('../../helpers/notification_helper');
const EBANKING_FUNCTIONS_URL = urls.EBANKING_FUNCTIONS_URL;

module.exports = function (req, res) {
    cors(req, res, async () => {
        if (!req.body.cronKey)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const callersCronKey = req.body.cronKey;
        const cronKey = functions.config().cron.key;
        const db = admin.firestore();
        const budgetIDs = [];
        const messages = [];
        const dateInterval = dateHelper.currentMonthInterval();

        if (callersCronKey !== cronKey)
            res.status(422).send({error: translator.t('cronKeyMatchFailed')});

        const budgetsWithAlarms = await db.collection("budgetAlarms").where("weeklyStatus", "==", true).get()
            .catch(() => res.status(422).send({error: translator.t('budgetAlarmsNotFound')}));

        budgetsWithAlarms.forEach((budget) => {
            budgetIDs.push({
                budgetID: budget.data().budgetID,
            })
        });

        for (const budget of budgetIDs) {
            const currentBudget = await db.collection("budgets").doc(budget.budgetID).get();
            const userID = currentBudget.data().userID;
            const totalGoalsAmount = currentBudget.data().totalGoalsAmount;
            const accountIDs = await accountsHelper.getLinkedAccounts(userID);

            let totalExpenseAmount = 0;
            try {
                const {data} =
                    await axios.get(`${EBANKING_FUNCTIONS_URL}/getExpensesBetweenDates` +
                        `?accountIDs=${accountIDs}&from=${dateInterval[0]}&to=${dateInterval[1]}`);

                data.forEach((expense) => {
                    totalExpenseAmount += expense.amount;
                });
            } catch (err) {
                res.status(422).send({error: translator.t('expensesOfMonthFetchFailed')});
            }

            const usedPercentage = Math.round((totalExpenseAmount / totalGoalsAmount) * 100);

            const user = await db.collection("users").doc(userID).get();
            const pushToken = user.data().pushToken;

            if (pushToken) {
                messages.push({
                    to: pushToken,
                    body: `${translator.t('weeklyStatusMessagePart1')}${usedPercentage}` +
                    `${translator.t('weeklyStatusMessagePart2')}`
                })
            }
        }

        await notificationHelper.sendNotifications(messages);
        res.status(200).send({success: true})
    });
};
