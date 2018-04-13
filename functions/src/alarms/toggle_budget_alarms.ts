import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
            const token = req.get('Authorization').split('Bearer ')[1];
            try {
                await admin.auth().verifyIdToken(token);
            } catch (err) {
                res.status(401).send({error: "Brugeren kunne ikke verificeres."});
            }

            if (!req.body.budgetID || !req.body.weeklyStatus || !req.body.budgetExceeded)
                return res.status(400).send({error: 'Fejl i anmodningen.'});

            const budgetID = String(req.body.budgetID);
            const budgetExceeded = Boolean(req.body.budgetExceeded);
            const weeklyStatus = Boolean(req.body.weeklyStatus);
            const db = admin.firestore();
            const budgetAlarmsCollection = db.collection("budgetAlarms");

            let querySnapshot;
            try {
                querySnapshot = await budgetAlarmsCollection
                    .where("budgetID", "==", budgetID)
                    .get();
            } catch (err) {
                res.status(422).send({error: 'Kunne ikke hente kategorialarmerne.'});
            }

            const budgetAlarm = querySnapshot[0];

            try {
                if (!budgetAlarm.exists)
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
                res.status(422).send({error: 'Kunne ikke sætte budgetalarmerne.'});
            }
        }
    );
};