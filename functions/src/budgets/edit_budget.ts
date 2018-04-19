import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an data
                if (!req.body.income ||
                    !req.body.disposable ||
                    !req.body.totalGoalsAmount)
                    return res.status(422).send({error: 'Fejl i anmodningen.'});

                const db = admin.firestore();
                const budgetID = String(req.body.budgetID);
                const income = String(req.body.income);
                const disposable = String(req.body.disposable);
                const totalGoalsAmount = String(req.body.totalGoalsAmount);

                // Update a budget using the income and category
                db.collection('budgets').doc(budgetID).update({
                    income,
                    disposable,
                    totalGoalsAmount
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke opdatere budget.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
