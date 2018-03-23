const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.name || !req.body.totalAmount || !req.body.budgetID || !req.body.debtID)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
                    return res.status(422).send({error: 'Ugyldig udløbsdato.'});

                if (!req.body.categories || req.body.categories.length === 0)
                    return res.status(422).send({error: 'Ingen kategorier valgt.'});

                const name = String(req.body.name);
                const totalAmount = parseInt(req.body.totalAmount);
                const expirationDate = dateHelper.toDate(req.body.expirationDate);
                const budgetID = String(req.body.budgetID);
                const debtID = String(req.body.debtID);
                const categories = req.body.categories;

                const db = admin.firestore();

                db.collection('debts').doc(debtID).get().then((doc) => {
                    if (!doc.exists)
                        res.status(422).send({error: 'Gæld kunne ikke findes.'});

                    let sum = 0;
                    let calcSumPromises = [];

                    for (let i = 0; i < categories.length; i++) {
                        const calcSumPromise = db.collection("categories").doc(categories[i]).get()
                            .then((doc) => {
                                if (!doc.exists)
                                    return res.status(400).send({error: 'Kategori kunne ikke findes.'});

                                sum += parseInt(doc.data().amount);
                            });
                        calcSumPromises.push(calcSumPromise);
                    }

                    doc.ref.update({
                        name: name,
                        expirationDate: expirationDate,
                        totalAmount: totalAmount,
                        budgetID: budgetID
                    })
                        .then(() => {
                            Promise.all(calcSumPromises)
                                .then(() => {
                                    const percentageToSubtract =
                                        ((totalAmount / sum) * 100) / dateHelper.numberOfMonthsUntilDate(expirationDate);

                                    console.log("per " + percentageToSubtract);

                                    if (percentageToSubtract > 100)
                                        return res.status(400).send({error: 'Kategoriernes beløb er ikke store nok.'});

                                    db.collection("categoryDebt").where("debtID", "==", debtID)
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
                                                    let modifyAmountsPromises = [];

                                                    for (let i = 0; i < categories.length; i++) {
                                                        const categoryID = String(categories[i]);

                                                        const modifyAmountsPromise = db.collection("categories").doc(categoryID)
                                                            .get()
                                                            .then((doc) => {
                                                                const categoryAmount = parseInt(doc.data().amount);
                                                                const amountToSubtract =
                                                                    Math.round((categoryAmount / 100) * percentageToSubtract);

                                                                doc.ref.update({
                                                                    amount: (categoryAmount - amountToSubtract)
                                                                })
                                                                    .catch(() => res.status(422)
                                                                        .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                                                                db.collection('categoryDebt').doc().set({
                                                                    debtID: debtID,
                                                                    categoryID: categoryID,
                                                                    amount: amountToSubtract
                                                                })
                                                                    .catch(() => res.status(422)
                                                                        .send({error: 'Fejl opstod under gældsoprettelsen.'}));
                                                            });

                                                        modifyAmountsPromises.push(modifyAmountsPromise);
                                                    }

                                                    Promise.all(modifyAmountsPromises)
                                                        .then(() => {
                                                            res.status(200).send({success: true});
                                                        });
                                                })
                                        });
                                });
                        })
                        .catch(() => res.status(422)
                            .send({error: 'Kunne ikke ændre gæld.'}));
                }).catch(() => res.status(401)
                    .send({error: 'Hentning af gæld fejlede.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
