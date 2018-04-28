import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categoryTypes").get();
        } catch (err) {
            res.status(422).send({error: translator.t('categoryFetchFailed')});
        }

        const categoryTypeArray = [];

        querySnapshot.forEach((doc) => {
            categoryTypeArray.push({id: doc.id, name: doc.data().name});
        });

        res.status(200).send(categoryTypeArray);
    })
};
