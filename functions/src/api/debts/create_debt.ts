import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('../../helpers/date_helper');
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        await tokenHelper.verifyToken(req, res);

        if (!req.body.name || !req.body.totalAmount || !req.body.budgetID)
            return res.status(422).send({error: translator.t('errorInEntry')});

        if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
            return res.status(422).send({error: translator.t('expirationDateInvalid')});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: translator.t('noCategoriesSelected')});

        const name = String(req.body.name);
        const totalAmount = parseInt(req.body.totalAmount);
        const budgetID = String(req.body.budgetID);
        const expirationDate = dateHelper.toDate(req.body.expirationDate);
        const amountPerMonth = Math.round(totalAmount / dateHelper.numberOfMonthsUntilDate(expirationDate));
        const categories = req.body.categories;
        const db = admin.firestore();

        let debtDoc;

        try {
            debtDoc = await db.collection('debts').add({
                name: name,
                totalAmount: totalAmount,
                amountPerMonth: amountPerMonth,
                expirationDate: expirationDate,
                budgetID: budgetID
            });
        } catch (err) {
            res.status(422).send({error: translator.t('debtCreationFailed')})
        }

        const updatePromises = [];

        categories.forEach(c => {
            const categoryID = String(c.categoryID);
            const amountToSubtract = parseInt(c.amountToSubtract);
            const newAmount = parseInt(c.newAmount);

            const updateCategoryPromise = db.collection("categories").doc(categoryID)
                .update({
                    amount: newAmount
                }).catch(() => res.status(422)
                    .send({error: translator.t('debtCreationFailed')}));

            updatePromises.push(updateCategoryPromise);

            const setCategoryDebtsPromise = db.collection('categoryDebts').doc()
                .set({
                    debtID: debtDoc.id,
                    categoryID: categoryID,
                    amount: amountToSubtract
                }).catch(() => res.status(422)
                    .send({error: translator.t('debtCreationFailed')}));

            updatePromises.push(setCategoryDebtsPromise);
        });

        await Promise.all(updatePromises);
        res.status(200).send({success: true});
    })
};
