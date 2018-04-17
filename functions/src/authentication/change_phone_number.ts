import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."})
        }

        if (!req.body.cprNumber || !req.body.cprNumber)
            return res.status(400).send({error: 'Fejl i indtastning.'});

        const cprNumber = String(req.body.cprNumber);
        const phoneNumber = String(req.body.phoneNumber);

        const db = admin.firestore();

        try {
            const userDoc = await db.collection("users").doc(cprNumber).get();

            await userDoc.ref.update({phoneNumber});
            return res.status(200).send({success: true});
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."})
        }
    });
};
