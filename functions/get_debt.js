const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.debtID)
                    return res.status(400).send({error: 'Fejl i anmodning.'});

                const debtID = String(req.query.debtID);
                const db = admin.firestore();

                db.collection("debts").doc(debtID)
                    .get()
                    .then((doc) => {
                        if (doc.exists)
                            res.status(422).send({error: 'Gæld kunne ikke findes.'});

                        const name = String(doc.data().name);
                        const totalAmount = parseInt(doc.data().totalAmount);
                        const budgetID = String(doc.data().budgetID);
                        const expirationDate = String(
                            dateHelper.toDateString(new Date(doc.data().expirationDate)));

                        db.collection("categoryDebt").where("debtID", "==", debtID)
                            .get()
                            .then((querySnapshot) => {
                                const categories = [];

                                querySnapshot.forEach((doc) => {
                                    categories.push(doc.data().categoryID);
                                });

                                res.status(200).send({
                                    name: name,
                                    totalAmount: totalAmount,
                                    expirationDate: expirationDate,
                                    budgetID: budgetID,
                                    categories: categories
                                });
                            })
                            .catch(() => res.status(422)
                                .send({error: 'Hentning af kategorier fejlede.'}));
                    }).catch(() => res.status(401)
                    .send({error: 'Hentning af gæld fejlede.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
