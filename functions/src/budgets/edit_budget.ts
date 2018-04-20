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

        // Verify that the user provided data
        if (!req.body.income ||
            !req.body.disposable ||
            !req.body.totalGoalsAmount)
            return res.status(422).send({error: 'Fejl i anmodningen.'});

        const db = admin.firestore();
        const budgetID = String(req.body.budgetID);
        const income = String(req.body.income);
        const disposable = String(req.body.disposable);
        const totalGoalsAmount = String(req.body.totalGoalsAmount);

        try {
            // Update a budget using the income and category
            await db.collection('budgets').doc(budgetID).update({
                income,
                disposable,
                totalGoalsAmount
            });

            res.status(200).send({success: true});
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke opdatere budget.'});
        }
    })
};
