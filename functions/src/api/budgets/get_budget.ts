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

        if (!req.query.budgetID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const db = admin.firestore();
        const budgetID = String(req.query.budgetID);

        let budgetDoc;
        try {
            budgetDoc = await db.collection('budgets').doc(budgetID).get();
        } catch (err) {
            res.status(422).send({error: translator.t('budgetNotFound')});
        }

        res.status(200).send({budgetData: budgetDoc.data()});
    })
};
