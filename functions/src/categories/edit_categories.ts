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

        // Verify that the user provided categories
        if (!req.body.categories)
            return res.status(422).send({error: 'Fejl i indtastning.'});

        const db = admin.firestore();
        const categories = req.body.categories;
        const budgetID = String(req.body.budgetID);
        const categoryID = String(req.body.categoryID);

        const categoriesCollection = db.collection("categories");

        const editPromises = [];

        categories.forEach(categoryDoc => {
            const editPromise = categoriesCollection.doc(categoryID).set({
                budgetID,
                categoryID,
                amount: parseInt(categoryDoc.amount)
            }, {merge: true});
            editPromises.push(editPromise);
        });

        await Promise.all(editPromises);
        res.status(200).send({success: true});
    });
};
