import admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('../helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.amount)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                if (!req.body.expirationDate || Date.now() >= dateHelper.toDate(req.body.expirationDate))
                    return res.status(422).send({error: 'Ugyldig udløbsdato.'});

                if (!req.body.categories || req.body.categories.length === 0)
                    return res.status(422).send({error: 'Ingen kategorier valgt.'});

                const amount = parseInt(req.body.amount);
                const expirationDate = dateHelper.toDate(req.body.expirationDate);
                const categories = req.body.categories;

                const db = admin.firestore();

                let sum = 0;
                const calcSumPromises = [];

                categories.forEach(categoryDoc => {
                    const calcSumPromise = db.collection("categories").doc(categoryDoc).get()
                        .then((doc) => {
                            if (!doc.exists)
                                return res.status(400).send({error: 'Kategori kunne ikke findes.'});

                            sum += parseInt(doc.data().amount);
                        });

                    calcSumPromises.push(calcSumPromise);
                });

                Promise.all(calcSumPromises)
                    .then(() => {
                        const percentageToSubtract =
                            ((amount / sum) * 100) / dateHelper.numberOfMonthsUntilDate(expirationDate);

                        if (percentageToSubtract > 100)
                            return res.status(400).send({error: 'Kategoriernes beløb er ikke store nok.'});

                        const modifyAmountsPromises = [];
                        const subtractionsArray = [];

                        categories.forEach(categoryDoc => {
                            const categoryID = String(categoryDoc);

                            const modifyAmountsPromise = db.collection("categories").doc(categoryID)
                                .get()
                                .then((doc) => {
                                    const categoryAmount = parseInt(doc.data().amount);
                                    const amountToSubtract =
                                        Math.round((categoryAmount / 100) * percentageToSubtract);

                                    subtractionsArray.push({categoryID, amountToSubtract});
                                });

                            modifyAmountsPromises.push(modifyAmountsPromise);
                        });

                        Promise.all(modifyAmountsPromises)
                            .then(() => {
                                res.status(200).send(subtractionsArray);
                            });
                    });
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
