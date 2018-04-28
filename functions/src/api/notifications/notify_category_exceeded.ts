import admin = require('firebase-admin');
import axios from 'axios';

const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const notificationHeler = require('../../helpers/notification_helper');
const dateHelper = require('../../helpers/date_helper');
const urls = require('../../strings/urls');
const translator = require('../../strings/translator');
const expenseFetcher = require('../../helpers/filter_helper');
const accountsHelper = require('../../helpers/accounts_helper');
const EBANKING_FUNCTIONS_URL = urls.EBANKING_FUNCTIONS_URL;

module.exports = function (req, res) {
    cors(req, res, async () => {
        if (!req.body.cronKey)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const callersCronKey = req.body.cronKey;
        const cronKey = functions.config().cron.key;
        const db = admin.firestore();
        const messages = [];
        const dateInterval = dateHelper.currentMonthInterval();

        if (callersCronKey !== cronKey)
            res.status(422).send({error: translator.t('cronKeyMatchFailed')});

        const categoryTypeArray = [];
        const categoryTypes = await db.collection("categoryTypes").get();
        categoryTypes.forEach((doc) => {
            categoryTypeArray.push({id: doc.id, name: doc.data().name});
        });

        const budgets = await db.collection("budgets").get();

        for (const budgetIndex in budgets.docs) {
            const budget = budgets.docs[budgetIndex];
            const categoryAlarms = await db.collection("categoryAlarms")
                .where("budgetID", "==", budget.id)
                .get();

            if (categoryAlarms.docs.length === 0) continue;

            const userID = budget.data().userID;
            const accountIDs = await accountsHelper.getLinkedAccounts(userID);
            let filteredExpenses;
            try {
                const {data} =
                    await axios.get(`${EBANKING_FUNCTIONS_URL}/getExpensesBetweenDates` +
                        `?accountIDs=${accountIDs}&from=${dateInterval[0]}&to=${dateInterval[1]}`);

                filteredExpenses = expenseFetcher.filterExpenses(data);
            } catch (err) {
                res.status(422).send({error: translator.t('expensesOfMonthFetchFailed')});
            }

            for (const alarmIndex in categoryAlarms.docs) {
                const alarm = categoryAlarms.docs[alarmIndex];

                const category = await db.collection("categories").doc(alarm.data().categoryID).get();
                const expenseIndex = filteredExpenses.findIndex
                (x => x.categoryTypeID === category.data().categoryTypeID);

                if (expenseIndex === -1 ||
                    filteredExpenses[expenseIndex].amount < category.data().amount)
                    continue;

                const user = await db.collection("users").doc(userID).get();
                const pushToken = user.data().pushToken;
                const nameIndex = categoryTypeArray.findIndex(x => x.id === category.data().categoryTypeID);
                const name = categoryTypeArray[nameIndex].name;

                if (pushToken) {
                    messages.push({
                        to: pushToken,
                        body: `${translator.t('categoryExceededMessage')}${name}.`
                    })
                }
            }
        }

        await notificationHeler.sendNotifications(messages);
        res.status(200).send({success: true})
    });
};
