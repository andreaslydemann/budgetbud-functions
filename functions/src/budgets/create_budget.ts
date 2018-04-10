import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income and userID
                if (!req.body.income || !req.body.userID)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                const db = admin.firestore();
                const userID = String(req.body.userID);
                const income = String(req.body.income);
                const totalExpenses = String(req.body.totalExpenses);
                const disposable = String(req.body.disposable);

                // Create a new budget
                const budgetRef = db.collection('budgets').doc();
                budgetRef.set({
                    userID,
                    income,
                    totalExpenses,
                    disposable
                })
                    .then(() => res.status(200).send({id: budgetRef.id, success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke oprette budget.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
