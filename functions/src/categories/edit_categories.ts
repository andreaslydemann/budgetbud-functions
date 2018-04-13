import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.categories)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                const db = admin.firestore();
                const categories = req.body.categories;
                const budgetID = String(req.body.budgetID);
                const categoryID = String(req.body.categoryID);

                const categoriesCollection = db.collection("categories");

                categories.forEach(categoryDoc => {
                    categoriesCollection.doc(categoryID).get()
                        .then(doc => {
                            if (!doc.exists) {
                                doc.ref.update({
                                    amount: categoryDoc.amount
                                })
                            }
                            else {
                                categoriesCollection.doc().set({
                                    categoryTypeID: categoryDoc.categoryTypeID,
                                    amount: categoryDoc.amount,
                                    budgetID
                                })
                            }
                        })
                        .then(() => res.status(200).send({success: true}))
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke opdatere kategori.'}));
                });
            })
    })
    .catch(err => res.status(401).send({error: err}));
};
