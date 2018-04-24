import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }
        if (!req.query.budgetID)
            return res.status(400).send({error: translator.t('errorInRequest')});

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
