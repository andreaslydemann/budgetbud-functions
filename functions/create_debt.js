const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

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

                const debtRef = db.collection('debts').doc();
                const debtID = debtRef.id;

                debtRef.set({
                    name: name,
                    amount: amount,
                    expirationDate: expirationDate,
                    budgetID: budgetID
                })
                    .then(() => {
                        Promise.all(calcSumPromises)
                            .then(() => {
                                const percentageToSubtract =
                                    ((amount / sum) * 100) / dateHelper.numberOfMonthsUntilDate(expirationDate);

                                if (percentageToSubtract > 100)
                                    return res.status(400).send({error: 'Kategoriernes beløb er ikke store nok.'});

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
                                            }).catch(() => res.status(422)
                                                .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                                            db.collection('categoryDebt').doc().set({
                                                debtID: debtID,
                                                categoryID: categoryID,
                                                amount: amountToSubtract
                                            }).catch(() => res.status(422)
                                                .send({error: 'Fejl opstod under gældsoprettelsen.'}));
                                        });

                                    modifyAmountsPromises.push(modifyAmountsPromise);
                                }

                                Promise.all(modifyAmountsPromises)
                                    .then(() => {
                                        res.status(200).send({success: true});
                                    });
                            });
                    })
                    .catch(() => res.status(422)
                        .send({error: 'Kunne ikke oprette gæld.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
