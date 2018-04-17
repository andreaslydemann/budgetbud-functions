import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const crypto = require('crypto');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."})
        }

        if (!req.body.cprNumber || !req.body.code)
            return res.status(400).send({error: 'Fejl i indtastning.'});

        const cprNumber = String(req.body.cprNumber);
        const code = parseInt(req.body.code);

        const db = admin.firestore();

        try {
            const userDoc = await db.collection("users").doc(cprNumber).get();

            const hash = crypto.pbkdf2Sync(code, userDoc.data().codeSalt,
                10000, 128, 'sha512').toString('hex');

            await userDoc.ref.update({codeHash: hash});
            return res.status(200).send({success: true});
        } catch (err) {
            res.status(401).send({error: "Fejl i hentning af brugeroplysninger."})
        }
    });
};
