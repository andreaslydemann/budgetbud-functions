const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
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

                const db = admin.firestore();
                const debtRef = db.collection('debts').doc();

                debtRef.set({
                    name: name,
                    expirationDate: expirationDate,
                    totalAmount: totalAmount,
                    budgetID: budgetID
                })
                    .then(() => {
                        const debtID = debtRef.id;
                        const categories = req.body.categories;

                        let sum = 0;
                        for (let i = 0; i < categories.length; i++) {
                            db.collection("categories").doc(categories[i]).get()
                                .then((doc) => {
                                    if (!doc.exists)
                                        return res.status(400).send({error: 'Kategori kunne ikke findes.'});

                                    sum += doc.data().amount;
                                });
                        }

                        const percentageToSubtract =
                            ((totalAmount / sum) * 100) / dateHelper.numberOfMonthsUntilDate(expirationDate);

                        for (let i = 0; i < categories.length; i++) {
                            const categoryID = String(categories[i]);

                            const catRef = db.collection("categories").doc(categoryID);
                            const amountToSubtract = Math.round((catRef.data().amount / 100) * percentageToSubtract);

                            catRef.update({
                                amount: (catRef.data().amount - amountToSubtract)
                            })
                                .catch(() => res.status(422)
                                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));

                            const catDebtRef = db.collection('categoryDebt').doc(categoryID);

                            catDebtRef.set({
                                debtID: debtID,
                                categoryID: categoryID,
                                amount: (catDebtRef.data().amount - amountToSubtract)
                            })
                                .catch(() => res.status(422)
                                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));
                        }

                        res.status(200).send({success: true});
                    })
                    .catch(() => res.status(422)
                        .send({error: 'Kunne ikke oprette gæld.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
