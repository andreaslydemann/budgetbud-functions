import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const db = admin.firestore();

        db.collection("debts")
            .get()
            .then(debts => {
                debts.forEach(debtDoc => {
                    if (new Date() <= new Date(debtDoc.data().expirationDate)) {
                        db.collection("categoryDebts")
                            .where("debtID", "==", debtDoc.id)
                            .get()
                            .then((categoryDebts) => {
                                const returnAmountsPromises = [];

                                categoryDebts.forEach(categoryDebtDoc => {
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

                                            debtDoc.ref.delete();
                                        });

                                    returnAmountsPromises.push(returnAmountsPromise);
                                });

                                Promise.all(returnAmountsPromises)
                                    .then(() => {
                                        res.status(200).send({success: true});
                                    });
                            });
                    }
                });
            })
            .catch(() => res.status(422).send({error: 'Kunne ikke hente gæld.'}));
    });
};
