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
        const totalAmount = parseInt(req.body.amount);
        const expirationDate = dateHelper.toDate(req.body.expirationDate);
        const amountPerMonth = (totalAmount / dateHelper.numberOfMonthsUntilDate(expirationDate));
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
                totalAmount: totalAmount,
                amountPerMonth: amountPerMonth,
                expirationDate: expirationDate,
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
        const updatePromises = [];

        try {
            const budgetDoc = await db.collection("budgets").doc(budgetID).get();
            const updateTotalGoalsAmountPromise = budgetDoc.ref.update({
                totalGoalsAmount: (budgetDoc.data().totalGoalsAmount + amountPerMonth),
                disposable: (budgetDoc.data().disposable - amountPerMonth)
            });

            updatePromises.push(updateTotalGoalsAmountPromise);
        } catch (err) {
            res.status(422).send({error: 'Fejl opstod under budgetændringen.'});
        }

        categories.forEach(c => {
            const categoryID = String(c.categoryID);
            const amountToSubtract = parseInt(c.amountToSubtract);
            const newAmount = parseInt(c.newAmount);

            const updateCategoryPromise = db.collection("categories").doc(categoryID)
                .update({
                    amount: newAmount
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældsændringen.'}));

            updatePromises.push(updateCategoryPromise);

            const setCategoryDebtsPromise = db.collection('categoryDebts').doc()
                .set({
                    debtID: debtDoc.id,
                    categoryID: categoryID,
                    amount: amountToSubtract
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældsændringen.'}));

            updatePromises.push(setCategoryDebtsPromise);
        });

        await Promise.all(updatePromises);
        res.status(200).send({success: true});
    })
};
