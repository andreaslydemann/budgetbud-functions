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

        if (!req.body.budgetID || !req.body.categoryID)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const budgetID = String(req.body.budgetID);
        const categoryID = String(req.body.categoryID);
        const db = admin.firestore();
        const categoryAlarmCollection = db.collection("categoryAlarms");

        let querySnapshot;
        try {
            querySnapshot = await categoryAlarmCollection
                .where("categoryID", "==", categoryID)
                .get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente kategorialarmerne.'});
        }

        if (querySnapshot.docs[0]) {
            try {
                await querySnapshot.docs[0].ref.delete();
                res.status(200).send({success: true});
            } catch (err) {
                res.status(422).send({error: 'Kunne ikke slette kategorialarm.'});
            }
        } else {
            try {
                await categoryAlarmCollection.doc().set({
                    categoryID,
                    budgetID,
                    hasTriggered: false
                });
                res.status(200).send({success: true});
            } catch (err) {
                res.status(422).send({error: 'Kunne ikke opret kategorialarm.'});
            }
        }
    });
};
