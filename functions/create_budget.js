const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.income)
                    return res.status(422).send({error: 'Indkomst er ikke et gyldigt beløb.'});

                // Verify that the user provided category data
                if (!req.body.category)
                    return res.status(422).send({error: 'Ugyldig kategoridata angivet.'});

                if (!req.body.cprNumber)
                    return res.status(422).send({error: 'CPR-nummer ikke modtaget.'});

                const cprNumber = String(req.body.cprNumber);

                // Format to remove dashes and parentheses
                const income = String(req.body.income);
                const totalCategories = String(req.body.category.length);

                const db = admin.firestore();

                // Create a new budget using the income and category
                // Respond to the user request, saying the account was made
                db.collection('budgets').doc(income).set({
                    income: income,
                    userID: cprNumber
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke oprette budget.'}));

                for (let i = 0; i < totalCategories; i++) {
                    let categoryName = String(req.body.category[i].name);
                    let categoryValue = String(req.body.category[i].value);
                    db.collection('categories').doc(categoryName).set({
                        name: categoryName,
                        value: categoryValue,
                        userID: cprNumber
                    })
                        .then(() => res.status(200).send({success: true}))
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke oprette kategori.'}));
                }
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
