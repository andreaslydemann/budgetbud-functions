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

        if (!req.body.cprNumber)
            return res.status(400).send({error: translator.t('cprNumberNotReceived')});

        const cprNumber = String(req.body.cprNumber);

        try {
            await admin.auth().deleteUser(cprNumber);
        } catch (err) {
            res.status(422).send({error: translator.t('userDeletionFailed')})
        }

        const db = admin.firestore();

        db.collection("users").doc(cprNumber).delete()
            .then(() => res.status(200).send({success: true}))
            .catch(() => res.status(422)
                .send({error: translator.t('errorInUserDeletion')}));

    });
};
