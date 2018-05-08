import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.budgetID)
            return res.status(400).send();

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();
        let budgetExceeded, weeklyStatus, querySnapshot;

        try {
            querySnapshot = await db.collection("budgetAlarms")
                .where("budgetID", "==", budgetID)
                .get();
        } catch (err) {
            res.status(422).send({error: translator.t('budgetAlarmsFetchFailed')});
        }

        const budgetAlarms = querySnapshot.docs[0];
        if (!budgetAlarms) {
            budgetExceeded = false;
            weeklyStatus = false;
        } else {
            budgetExceeded = budgetAlarms.data().budgetExceeded;
            weeklyStatus = budgetAlarms.data().weeklyStatus;
        }
        const alarms = {budgetExceeded, weeklyStatus};
        res.status(200).send(alarms);
    })
};
