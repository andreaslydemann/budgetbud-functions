import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.cprNumber)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const cprNumber = String(req.query.cprNumber);
        const db = admin.firestore();

        try {
            const userDoc = await db.collection("users").doc(cprNumber).get();
            res.status(200).send({phoneNumber: userDoc.data().phoneNumber});
        } catch (err) {
            res.status(401).send({error: translator.t('userDataFetchFailed')})
        }
    });
};
