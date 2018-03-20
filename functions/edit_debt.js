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

                const db = admin.firestore();
                const docRef = db.collection('debts').doc(debtID);

                docRef.get().then((doc) => {
                    if (doc.exists) {

                        docRef.update({
                            name: name,
                            expirationDate: expirationDate,
                            totalAmount: totalAmount,
                            budgetID: budgetID
                        })
                            .then(() => {
                                const categories = req.body.categories;
                                const amountPerCategory = Math.round(totalAmount / categories.length);

                                db.collection("categoryDebt").where("debtID", "==", debtID)
                                    .get()
                                    .then((querySnapshot) => {
                                        querySnapshot.forEach((doc) => {
                                            doc.ref.delete();
                                        });

                                        for (let i = 0; i < categories.length; i++) {
                                            let categoryID = String(categories[i]);

                                            db.collection('categoryDebt').doc().set({
                                                debtID: debtID,
                                                categoryID: categoryID,
                                                amount: amountPerCategory
                                            })
                                                .then(() => res.status(200).send({success: true}))
                                                .catch(() => res.status(422)
                                                    .send({error: 'Fejl opstod under gældsændringen.'}));
                                        }
                                    })
                            })
                            .catch(() => res.status(422).send({error: 'Kunne ikke ændre gæld.'}));
                    } else {
                        res.status(422).send({error: 'Gæld kunne ikke findes.'})
                    }
                }).catch(() => res.status(401).send({error: 'Ukendt fejl opstod.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    })
};
