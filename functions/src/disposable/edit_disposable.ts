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

        if (!req.body.disposable || !req.body.budgetID)
            return res.status(422).send({error: translator.t('errorInEntry')});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: translator.t('noCategoriesSelected')});

        const disposable = parseInt(req.body.disposable);
        const budgetID = String(req.body.budgetID);
        const categories = req.body.categories;
        const db = admin.firestore();

        const updatePromises = [];

        categories.forEach(c => {
            const categoryID = String(c.categoryID);
            const newAmount = parseInt(c.newAmount);

            const updateCategoryPromise = db.collection("categories").doc(categoryID)
                .update({
                    amount: newAmount
                }).catch(() => res.status(422)
                    .send({error: translator.t('disposableUpdateFailed')}));

            updatePromises.push(updateCategoryPromise);
        });

        await db.collection("budgets").doc(budgetID)
            .get()
            .then((budgetDoc) => {
                const updateDisposablePromise = budgetDoc.ref.update({
                    disposable: disposable,
                    totalGoalsAmount: (budgetDoc.data().income - disposable)
                }).catch(() => res.status(422)
                    .send({error: translator.t('disposableUpdateFailed')}));

                updatePromises.push(updateDisposablePromise);
            }).catch(() => res.status(422)
                .send({error: translator.t('disposableUpdateFailed')}));

        await Promise.all(updatePromises);
        res.status(200).send({success: true});
    })
};
