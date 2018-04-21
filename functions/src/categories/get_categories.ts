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

        if (!req.query.budgetID)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categories").where("budgetID", "==", budgetID).get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente kategorier.'});
        }

        const categoryArray = [];

        querySnapshot.forEach((doc) => {
            categoryArray.push({id: doc.id, categoryData: doc.data()});
        });

        res.status(200).send(categoryArray);
    })
};
