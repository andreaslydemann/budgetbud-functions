const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
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

                db.collection('debts').doc(debtID).get().then((doc) => {
                    if (!doc.exists)
                        res.status(422).send({error: 'Gæld kunne ikke findes.'});

                    doc.ref.update({
                        name: name,
                        expirationDate: expirationDate,
                        amount: amount,
                        budgetID: budgetID
                    })
                        .then(() => {
                            db.collection("categoryDebts").where("debtID", "==", debtID)
                                .get()
                                .then((querySnapshot) => {
                                    let returnAmountsPromises = [];

                                    for (let i = 0; i < querySnapshot.docs.length; i++) {
                                        let categoryAmount = querySnapshot.docs[i].data().amount;
                                        let categoryID = querySnapshot.docs[i].data().categoryID;

                                        let returnAmountsPromise = db.collection("categories").doc(categoryID)
                                            .get()
                                            .then((doc) => {
                                                doc.ref.update({
                                                    amount: (doc.data().amount + categoryAmount)
                                                })
                                                    .catch(() => res.status(422)
                                                        .send({error: 'Fejl opstod under gældsændringen.'}));

                                                querySnapshot.docs[i].ref.delete();
                                            });

                                        returnAmountsPromises.push(returnAmountsPromise);
                                    }

                                    Promise.all(returnAmountsPromises)
                                        .then(() => {
                                            let promises = [];

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
                                                        debtID: doc.id,
                                                        categoryID: categoryID,
                                                        amount: amountToSubtract
                                                    }).catch(() => res.status(422)
                                                        .send({error: 'Fejl opstod under gældsændringen.'}));

                                                promises.push(setCategoryDebtsPromise);
                                            });

                                            Promise.all(promises)
                                                .then(() => {
                                                    res.status(200).send({success: true});
                                                });
                                        });
                                });
                        })
                        .catch(() => res.status(422)
                            .send({error: 'Kunne ikke ændre gæld.'}));
                }).catch(() => res.status(401)
                    .send({error: 'Hentning af gæld fejlede.'}));
            }).catch(() => res.status(401)
            .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
