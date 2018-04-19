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

        if (!req.body.budgetID)
            return res.status(422).send({error: 'Fejl i anmodningen'});

        const db = admin.firestore();
        const categories = req.body.categories;
        const budgetID = String(req.body.budgetID);

        const categoriesCollection = db.collection("categories");
        const editPromises = [];
        let editPromise;

        categories.forEach(categoryDoc => {
            const categoryTypeID = String(categoryDoc.categoryTypeID);
            const categoryAmount = parseInt(categoryDoc.amount);
            if (categoryAmount > 0) {
                if(categoryDoc.categoryID) {
                    editPromise = categoriesCollection.doc(categoryDoc.categoryID).update({
                        amount: categoryAmount
                    })
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke redigere kategori.'}));
                } else {
                    editPromise = categoriesCollection.doc().set({
                        amount: categoryAmount,
                        budgetID,
                        categoryTypeID
                    })
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke redigere kategori.'}));
                }
                editPromises.push(editPromise);
            }
        });

        await Promise.all(editPromises);
        res.status(200).send({success: true});
    });
};
