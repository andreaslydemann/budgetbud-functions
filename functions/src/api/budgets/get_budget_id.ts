import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        const db = admin.firestore();
        const userID = String(req.query.userID);

        let querySnapshot;
        try {
            querySnapshot = await db.collection('budgets')
                .where("userID", "==", userID)
                .get();
        } catch (err) {
            res.status(422).send({error: translator.t('budgetNotFound')});
        }

        if (!querySnapshot.docs[0])
            return res.status(400).send({error: translator.t('budgetNotFound')});

        res.status(200).send(querySnapshot.docs[0].id);
    })
};
