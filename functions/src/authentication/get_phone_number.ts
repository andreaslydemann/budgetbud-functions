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

        if (!req.query.cprNumber)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const cprNumber = String(req.query.cprNumber);
        const db = admin.firestore();

        try {
            const userDoc = await db.collection("users").doc(cprNumber).get();
            res.status(200).send({phoneNumber: userDoc.data().phoneNumber});
        } catch (err) {
            res.status(401).send({error: "Fejl i hentning af brugeroplysninger."})
        }
    });
};
