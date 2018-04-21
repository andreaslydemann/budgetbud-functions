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

            if (!req.body.budgetID)
                return res.status(400).send({error: translator.t('errorInRequest')});

            const budgetID = String(req.body.budgetID);
            const budgetExceeded = req.body.budgetExceeded;
            const weeklyStatus = req.body.weeklyStatus;
            const db = admin.firestore();
            const budgetAlarmsCollection = db.collection("budgetAlarms");

            let querySnapshot;
            try {
                querySnapshot = await budgetAlarmsCollection
                    .where("budgetID", "==", budgetID)
                    .get();
            } catch (err) {
                res.status(422).send({error: translator.t('budgetAlarmsFetchFailed')});
            }

            const budgetAlarm = querySnapshot.docs[0];

            try {
                if (!budgetAlarm)
                    await budgetAlarmsCollection.doc().set({
                        budgetID,
                        budgetExceeded,
                        weeklyStatus,
                        hasTriggered: false
                    });
                else
                    await budgetAlarm.ref.update({
                        budgetExceeded,
                        weeklyStatus
                    });
                res.status(200).send({success: true});
            } catch (err) {
                res.status(422).send({error: translator.t('budgetAlarmsUpdateFailed')});
            }
        }
    );
};
