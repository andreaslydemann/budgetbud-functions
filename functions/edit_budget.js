const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.income || !req.body.categories)
                    return res.status(422).send({error: 'Fejl i indtastningen.'});

                const budgetID = String(req.body.budgetID);
                const income = String(req.body.income);
                const db = admin.firestore();

                console.log("Log 1")

                // Update a budget using the income and category
                db.collection('budgets').doc(budgetID).update({
                    income: income
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke opdatere budget.'}));

                console.log("Log 2")

                const categories = req.body.categories;
                const totalCategories = String(req.body.categories.length);

                for (let i = 0; i < totalCategories; i++) {
                    let categoryAmount = String(categories[i].amount);
                    console.log("Amount: " + categoryAmount);
                    db.collection('categories').where("budgetID", "==", budgetID).update(
                        {amount: categoryAmount},
                        {merge: true})
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke opdatere kategori.'}));
                }
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
