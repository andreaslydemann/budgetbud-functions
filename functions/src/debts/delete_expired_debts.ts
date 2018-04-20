import admin = require('firebase-admin');

const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const db = admin.firestore();

        if (!req.query.cronKey)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const callersCronKey = req.query.cronKey;
        const cronKey = functions.config().cron.key;

        if (callersCronKey !== cronKey)
            res.status(422).send({error: 'Cron key matchede ikke.'});

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

                const getCategoriesPromises = [];

                categoryDebts.forEach(categoryDebtDoc => {
                    const returnAmountsPromise = db.collection("categories")
                        .doc(categoryDebtDoc.data().categoryID)
                        .get();

                    getCategoriesPromises.push(returnAmountsPromise);
                });

                const values = await Promise.all(getCategoriesPromises);
                const returnAmountsPromises = [];

                values.forEach(categoryDoc => {
                    const categoryDebtDoc = categoryDebts.docs.filter((obj) => {
                        return obj.data().categoryID === categoryDoc.id;
                    });

                    const returnAmountsPromise = categoryDoc.ref.update({
                        amount: (categoryDoc.data().amount + categoryDebtDoc[0].data().amount)
                    }).catch(() => res.status(422)
                        .send({error: 'Fejl opstod under gældssletningen'}));

                    returnAmountsPromises.push(returnAmountsPromise);
                    returnAmountsPromises.push(categoryDebtDoc[0].ref.delete());
                });

                await Promise.all(returnAmountsPromises);
                res.status(200).send({success: true});
            }
        }
    });
};
