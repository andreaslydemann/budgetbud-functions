import admin = require('firebase-admin');

const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const db = admin.firestore();

        if (!req.body.cronKey)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const callersCronKey = req.body.cronKey;
        const cronKey = functions.config().cron.key;

        if (callersCronKey !== cronKey)
            res.status(422).send({error: 'Cron key matchede ikke.'});

        let debtsRef;
        let debts;
        try {
            debtsRef = db.collection("debts");
            debts = await debtsRef.get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente gæld.'});
        }

        for (let index in debts.docs) {
            if (new Date() <= new Date(debts.docs[index].data().expirationDate))
                continue;

            let categoryDebts;
            try {
                categoryDebts = await db.collection("categoryDebts")
                    .where("debtID", "==", debts.docs[index].id)
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
            const promises = [];

            values.forEach(categoryDoc => {
                const categoryDebtDoc = categoryDebts.docs.filter((obj) => {
                    return obj.data().categoryID === categoryDoc.id;
                });

                const returnAmountsPromise = categoryDoc.ref.update({
                    amount: (categoryDoc.data().amount + categoryDebtDoc[0].data().amount)
                }).catch(() => res.status(422)
                    .send({error: 'Fejl opstod under gældssletningen'}));

                promises.push(returnAmountsPromise);
                promises.push(categoryDebtDoc[0].ref.delete());
            });

            promises.push(debtsRef.doc(debts.docs[index].id).delete());
            await Promise.all(promises);
        }

        res.status(200).send({success: true});
    });
};
