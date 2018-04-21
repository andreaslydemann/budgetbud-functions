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

        if (!req.query.budgetID)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const db = admin.firestore();
        const budgetID = String(req.query.budgetID);

        let budgetDoc;
        try {
            budgetDoc = await db.collection('budgets').doc(budgetID).get();
        } catch (err) {
            res.status(422).send({error: "Kunne ikke finde budgettet."});
        }

        res.status(200).send({budgetData: budgetDoc.data()});
    })
};
