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

                if (!req.body.cprNumber)
                    return res.status(422).send({error: 'CPR-nummer ikke modtaget.'});

                const cprNumber = String(req.body.cprNumber);
                const income = String(req.body.income);
                const db = admin.firestore();

                // Update a budget using the income and category
                db.collection('budgets').where("userID", "==", cprNumber).update({
                    income: income
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke opdatere budget.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
