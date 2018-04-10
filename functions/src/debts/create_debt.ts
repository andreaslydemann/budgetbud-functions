import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const dateHelper = require('../helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.name || !req.body.amount || !req.body.budgetID)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
                    return res.status(422).send({error: 'Ugyldig udløbsdato.'});

                if (!req.body.categories || req.body.categories.length === 0)
                    return res.status(422).send({error: 'Ingen kategorier valgt.'});

                const name = String(req.body.name);
                const amount = parseInt(req.body.amount);
                const budgetID = String(req.body.budgetID);
                const expirationDate = dateHelper.toDate(req.body.expirationDate);
                const categories = req.body.categories;

                const db = admin.firestore();

                db.collection('debts').add({
                    name: name,
                    amount: amount,
                    expirationDate: expirationDate,
                    budgetID: budgetID
                })
                    .then(doc => {
                        const promises = [];

                        categories.forEach(c => {
                            const categoryID = String(c.categoryID);
                            const amountToSubtract = parseInt(c.amountToSubtract);
                            const newAmount = parseInt(c.newAmount);

                            const updateCategoryPromise = db.collection("categories").doc(categoryID)
                                .update({
                                    amount: newAmount
                                }).catch(() => res.status(422)
                                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                            promises.push(updateCategoryPromise);

                            const setCategoryDebtsPromise = db.collection('categoryDebts').doc()
                                .set({
                                    debtID: doc.id,
                                    categoryID: categoryID,
                                    amount: amountToSubtract
                                }).catch(() => res.status(422)
                                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                            promises.push(setCategoryDebtsPromise);
                        });
/*
                        db.collection("budgets").doc(budgetID)
                            .get()
                            .then(budgetDoc => {
                                const updateTotalGoalsAmountPromise = budgetDoc.ref.update({
                                    totalGoalsAmount: (budgetDoc.data().totalGoalsAmount + amount)
                                })
                                    .catch(() => res.status(422)
                                        .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                                promises.push(updateTotalGoalsAmountPromise);
                            });*/

                        Promise.all(promises)
                            .then(() => {
                                res.status(200).send({success: true});
                            });
                    })
                    .catch(() => res.status(422)
                        .send({error: "Gæld kunne ikke oprettes."}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
