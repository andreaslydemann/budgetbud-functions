const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.income || !req.body.userID || !req.body.categories)
                    return res.status(422).send({error: 'Fejl i indtastningen.'});

                const db = admin.firestore();
                const userID = String(req.body.userID);
                const income = String(req.body.income);
                const totalCategories = String(req.body.categories.length);
                const budgetID = String(req.body.budgetID);
                const categories = req.body.categories;

                // Create a new budget using the income and category
                db.collection('budgets').doc().set({
                    income,
                    userID
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke oprette budget.'}));

                for (let i = 0; i < totalCategories; i++) {
                    let categoryName = String(categories[i].name);
                    let categoryAmount = String(categories[i].amount);
                    db.collection('categories').doc().set({
                        name: categoryName,
                        amount: categoryAmount,
                        budgetID
                    })
                        .then(() => res.status(200).send({success: true}))
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke oprette kategori.'}));
                }
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
