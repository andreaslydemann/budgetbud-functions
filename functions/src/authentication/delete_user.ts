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

        if (!req.body.cprNumber)
            return res.status(400).send({error: 'CPR-nummer ikke modtaget.'});

        const cprNumber = String(req.body.cprNumber);

        try {
            await admin.auth().deleteUser(cprNumber);
        } catch (err) {
            res.status(422).send({error: 'Sletning af brugeren fejlede.'})
        }

        const db = admin.firestore();

        db.collection("users").doc(cprNumber).delete()
            .then(() => res.status(200).send({success: true}))
            .catch(() => res.status(422)
                .send({error: 'Bruger blev slettet, men tilknyttet data blev ikke.'}));

    });
};
