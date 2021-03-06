import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        // Verify that the user provided categories
        if (!req.body.categories || !req.body.budgetID)
            return res.status(422).send({error: translator.t('errorInRequest')});

        const db = admin.firestore();
        const categories = req.body.categories;
        const budgetID = String(req.body.budgetID);

        const categoriesCollection = db.collection("categories");
        const editPromises = [];
        let editPromise;

        categories.forEach(categoryDoc => {
            const categoryTypeID = String(categoryDoc.categoryTypeID);
            const categoryAmount = parseInt(categoryDoc.amount);
            if (categoryDoc.categoryID) {
                editPromise = categoriesCollection.doc(categoryDoc.categoryID).update({
                    amount: categoryAmount
                })
                    .catch(() => res.status(422)
                        .send({error: translator.t('categoryUpdateFailed')}));
            } else {
                editPromise = categoriesCollection.doc().set({
                    amount: categoryAmount,
                    budgetID,
                    categoryTypeID
                })
                    .catch(() => res.status(422)
                        .send({error: translator.t('categoryUpdateFailed')}));
            }
            editPromises.push(editPromise);
        });

        await Promise.all(editPromises);
        res.status(200).send({success: true});
    });
};
