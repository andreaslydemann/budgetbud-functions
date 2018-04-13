import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const db = admin.firestore();

        let debts;
        try {
            debts = await db.collection("debts").get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente gæld.'});
        }

        for (const debtDoc of debts) {
            if (new Date() <= new Date(debtDoc.data().expirationDate)) {
                let categoryDebts;
                try {
                    categoryDebts = await db.collection("categoryDebts")
                        .where("debtID", "==", debtDoc.id)
                        .get();
                } catch (err) {
                    res.status(422).send({error: 'Fejl opstod under gældssletningen.'});
                }

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
            }
        }
    });
};
