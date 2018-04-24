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

        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categoryTypes").get();
        } catch (err) {
            res.status(422).send({error: translator.t('categoryFetchFailed')});
        }

        const categoryTypeArray = [];

        querySnapshot.forEach((doc) => {
            categoryTypeArray.push({id: doc.id, name: doc.data().name});
        });

        res.status(200).send(categoryTypeArray);
    })
};
