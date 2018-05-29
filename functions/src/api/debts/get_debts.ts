import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const dateHelper = require('../../helpers/date_helper');
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.query.budgetID)
            return res.status(400).send({error: translator.t('errorInRequest')});

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("debts")
                .where("budgetID", "==", budgetID)
                .get();
        } catch (err) {
            res.status(422).send({error: translator.t('debtFetchFailed')});
        }

        const debtArray = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            data.expirationDate = String(
                dateHelper.toDateString(new Date(doc.data().expirationDate)));

            debtArray.push({id: doc.id, debtData: data});
        });

        res.status(200).send(debtArray);
    });
};
