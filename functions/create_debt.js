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
                const docRef = db.collection('debts').doc();

                docRef.set({
                    name: name,
                    expirationDate: expirationDate,
                    totalAmount: totalAmount,
                    budgetID: budgetID
                })
                    .then(() => {
                        const debtID = docRef.id;
                        const categories = req.body.categories;
                        const amountPerCategory = Math.round(totalAmount / categories.length);

                        for (let i = 0; i < categories.length; i++) {
                            let categoryID = String(categories[i]);

                            db.collection('categoryDebt').doc().set({
                                debtID: debtID,
                                categoryID: categoryID,
                                amount: amountPerCategory
                            })
                                .then(() => res.status(200).send({success: true}))
                                .catch(err => res.status(422)
                                    .send({error: 'Fejl opstod under gældsoprettelsen.'}));
                        }
                    })
                    .catch(err => res.status(422).send({error: 'Kunne ikke oprette gæld.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
