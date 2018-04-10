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

        if (!req.body.name || !req.body.amount || !req.body.budgetID || !req.body.debtID)
            return res.status(422).send({error: 'Fejl i indtastning.'});

        if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
            return res.status(422).send({error: 'Ugyldig udløbsdato.'});

        if (!req.body.categories || req.body.categories.length === 0)
            return res.status(422).send({error: 'Ingen kategorier valgt.'});

        const name = String(req.body.name);
        const amount = parseInt(req.body.amount);
        const expirationDate = dateHelper.toDate(req.body.expirationDate);
        const budgetID = String(req.body.budgetID);
        const debtID = String(req.body.debtID);
        const categories = req.body.categories;

        const db = admin.firestore();

        let debtDoc;
        let querySnapshot;
        try {
            debtDoc = await db.collection('debts').doc(debtID).get();

            if (!debtDoc.exists)
                res.status(422).send({error: 'Gæld kunne ikke findes.'});

            await debtDoc.ref.update({
                name: name,
                expirationDate: expirationDate,
                amount: amount,
                budgetID: budgetID
            });

            querySnapshot = await db.collection("categoryDebts")
                .where("debtID", "==", debtID)
                .get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke ændre gæld.'})
        }

        const returnAmountsPromises = [];

        querySnapshot.forEach(categoryDebtDoc => {
            const categoryAmount = categoryDebtDoc.data().amount;
            const categoryID = categoryDebtDoc.data().categoryID;

            const returnAmountsPromise = db.collection("categories").doc(categoryID)
                .get()
                .then(categoryDoc => {
                    categoryDoc.ref.update({
                        amount: (categoryDoc.data().amount + categoryAmount)
                    })
                        .catch(() => res.status(422)
                            .send({error: 'Fejl opstod under gældsændringen.'}));

                    categoryDebtDoc.ref.delete();
                });

            returnAmountsPromises.push(returnAmountsPromise);
        });

        await Promise.all(returnAmountsPromises);
        const promises = [];

        categories.forEach(c => {
            const categoryID = String(c.categoryID);
            const amountToSubtract = parseInt(c.amountToSubtract);
            const newAmount = parseInt(c.newAmount);

            const updateCategoryPromise = db.collection("categories").doc(categoryID)
                .update({
                    amount: newAmount
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældsændringen.'}));

            promises.push(updateCategoryPromise);

            const setCategoryDebtsPromise = db.collection('categoryDebts').doc()
                .set({
                    debtID: debtDoc.id,
                    categoryID: categoryID,
                    amount: amountToSubtract
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældsændringen.'}));

            promises.push(setCategoryDebtsPromise);
        });

        /*
        const updateTotalGoalsAmountPromise = db.collection("budgets").doc(budgetID)
            .update({
                totalGoalsAmount: amount
            }).catch(() => res.status(422)
                .send({error: 'Fejl opstod under gældsændringen.'}));

        promises.push(updateTotalGoalsAmountPromise);*/

        await Promise.all(promises);
        res.status(200).send({success: true});
    })
};
