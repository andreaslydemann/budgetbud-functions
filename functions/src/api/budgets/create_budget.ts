import admin = require('firebase-admin');
import {isUndefined} from "util";

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        // Verify that the user provided an income and userID
        if (isUndefined(req.body.income) || !req.body.userID)
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
