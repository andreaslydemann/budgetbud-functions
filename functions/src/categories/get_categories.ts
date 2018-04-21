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

        if (!req.query.budgetID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categories").where("budgetID", "==", budgetID).get();
        } catch (err) {
            res.status(422).send({error: translator.t('categoryFetchFailed')});
        }

        const categoryArray = [];

        querySnapshot.forEach((doc) => {
            categoryArray.push({id: doc.id, categoryData: doc.data()});
        });

        res.status(200).send(categoryArray);
    })
};
