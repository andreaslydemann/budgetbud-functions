import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('../helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."});
        }

        if (!req.body.name || !req.body.totalAmount || !req.body.budgetID)
            return res.status(422).send({error: 'Fejl i indtastning.'});

        if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
            return res.status(422).send({error: 'Ugyldig udløbsdato.'});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: 'Ingen kategorier valgt.'});

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
            res.status(422).send({error: "Gæld kunne ikke oprettes."})
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
                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));

            updatePromises.push(updateCategoryPromise);

            const setCategoryDebtsPromise = db.collection('categoryDebts').doc()
                .set({
                    debtID: debtDoc.id,
                    categoryID: categoryID,
                    amount: amountToSubtract
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));

            updatePromises.push(setCategoryDebtsPromise);
        });

        await Promise.all(updatePromises);
        res.status(200).send({success: true});
    })
};
