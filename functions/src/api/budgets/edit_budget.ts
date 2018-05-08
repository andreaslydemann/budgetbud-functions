import admin = require('firebase-admin');
import {isUndefined} from "util";

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        // Verify that the user provided data
        if (isUndefined(req.body.income) ||
            isUndefined(req.body.disposable) ||
            isUndefined(req.body.totalGoalsAmount))
            return res.status(422).send({error: translator.t('errorInRequest')});

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
            res.status(422).send({error: translator.t('budgetUpdateFailed')});
        }
    })
};
