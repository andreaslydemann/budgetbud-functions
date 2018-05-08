import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        // Verify that the user provided an income
        if (!req.body.categories || !req.body.budgetID)
            return res.status(422).send({error: translator.t('errorInRequest')});

        const db = admin.firestore();
        const categories = req.body.categories;
        const budgetID = String(req.body.budgetID);

        const createPromises = [];
        categories.forEach(categoryDoc => {
            const categoryTypeID = String(categoryDoc.categoryTypeID);
            const categoryAmount = parseInt(categoryDoc.amount);
            if (categoryAmount > 0) {
                const createPromise = db.collection('categories').doc().set({
                    categoryTypeID,
                    amount: categoryAmount,
                    budgetID
                }).catch(err => res.status(422)
                        .send({error: translator.t('categoryCreationFailed')}));

                createPromises.push(createPromise);
            }
        });

        await Promise.all(createPromises);
        res.status(200).send({success: true});
    })
};
