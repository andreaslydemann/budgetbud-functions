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

        if (!req.body.userID || !req.body.pushToken)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const userID = String(req.body.userID);
        const pushToken = String(req.body.pushToken);
        const db = admin.firestore();

        let userDoc;
        try {
            userDoc = await db.collection("users").doc(userID).get();
        } catch (err) {
            res.status(401).send({error: "Fejl i hentning af brugeroplysninger."})
        }

        if (!userDoc.exists)
            return res.status(400).send({error: 'Bruger er ikke registreret.'});

        try {
            await userDoc.ref.update({pushToken});
            res.status(200).send({success: true});
        } catch (err) {
            res.status(401).send({error: "Kunne ikke sætte push token."})
        }
    });
};
