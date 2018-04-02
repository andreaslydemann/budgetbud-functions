import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.debtID)
                    return res.status(400).send({error: 'Intet gæld er angivet.'});

                const debtID = String(req.body.debtID);
                const db = admin.firestore();

                db.collection('debts').doc(debtID)
                    .get()
                    .then(debtDoc => {
                        if (!debtDoc.exists)
                            res.status(422).send({error: 'Gæld kunne ikke findes.'});

                        db.collection("debts").doc(debtID).delete()
                            .then(() => {
                                db.collection("categoryDebts")
                                    .where("debtID", "==", debtID)
                                    .get()
                                    .then((querySnapshot) => {
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
                                                            .send({error: 'Fejl opstod under gældssletningen.'}));

                                                    categoryDebtDoc.ref.delete();
                                                });

                                            returnAmountsPromises.push(returnAmountsPromise);
                                        });

                                        Promise.all(returnAmountsPromises)
                                            .then(() => {
                                                res.status(200).send({success: true});
                                            });
                                    });
                            })
                            .catch(() => res.status(422)
                                .send({error: 'Sletning af gælden fejlede.'}));
                    }).catch(() => res.status(401)
                    .send({error: 'Hentning af gæld fejlede.'}));
            }).catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    });
};
