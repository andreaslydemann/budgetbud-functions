const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
            const token = req.get('Authorization').split('Bearer ')[1];
            admin.auth().verifyIdToken(token)
                .then(() => {
                    // Verify that the user provided an data
                    if (!req.body.income || !req.body.categories)
                        return res.status(422).send({error: 'Fejl i indtastningen.'});

                    const db = admin.firestore();
                    const budgetID = String(req.body.budgetID);
                    const income = String(req.body.income);
                    const categories = req.body.categories;

                    // Update a budget using the income and category
                    db.collection('budgets').doc(budgetID).update({
                        income: income
                    })
                        .then(() => res.status(200).send({success: true}))
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke opdatere budget.'}));

                    categories.forEach(categoryDoc => {
                        db.collection("categories")
                            .where("budgetID", "==", budgetID)
                            .get()
                            .then((doc) => {
                                if (!doc.exists)
                                    return res.status(400).send({error: 'Kategori kunne ikke findes.'});

                                doc.ref.update({
                                    amount: categoryDoc.amount
                                })
                            }).catch(err => res.status(422)
                            .send({error: 'Kunne ikke opdatere kategori.'}));
                    });
                }).catch(err => res.status(401).send({error: err}));
        }
    )
};
