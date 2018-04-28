import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')})
        }

        if (!req.body.cprNumber || !req.body.cprNumber)
            return res.status(400).send({error: translator.t('errorInEntry')});

        const cprNumber = String(req.body.cprNumber);
        const phoneNumber = String(req.body.phoneNumber);

        const db = admin.firestore();

        try {
            const userDoc = await db.collection("users").doc(cprNumber).get();

            await userDoc.ref.update({phoneNumber});
            return res.status(200).send({success: true});
        } catch (err) {
            res.status(401).send({error: translator.t('phoneNumberUpdateFailed')})
        }
    });
};
