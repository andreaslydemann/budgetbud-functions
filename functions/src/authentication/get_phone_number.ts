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
