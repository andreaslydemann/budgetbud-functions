import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

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
