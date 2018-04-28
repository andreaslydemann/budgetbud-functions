import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

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
