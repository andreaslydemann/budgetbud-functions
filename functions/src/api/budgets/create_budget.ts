import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }

        // Verify that the user provided an income and userID
        if (!req.body.income || !req.body.userID)
            return res.status(422).send({error: translator.t('errorInEntry')});

        const db = admin.firestore();
        const userID = String(req.body.userID);
        const income = parseInt(req.body.income);
        const totalGoalsAmount = parseInt(req.body.totalGoalsAmount);
        const disposable = parseInt(req.body.disposable);

        try {
            const budgetRef = db.collection('budgets').doc();

            await budgetRef.set({
                userID,
                income,
                totalGoalsAmount,
                disposable
            });

            res.status(200).send({id: budgetRef.id, success: true});
        } catch (err) {
            res.status(422).send({error: translator.t('budgetCreationFailed')});
        }
    })
};
