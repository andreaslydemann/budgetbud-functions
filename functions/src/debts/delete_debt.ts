import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."})
        }

        if (!req.body.debtID)
            return res.status(400).send({error: 'Intet gæld er angivet.'});

        const debtID = String(req.body.debtID);
        const db = admin.firestore();

        let debtDoc;
        let categoryDebts;
        try {
            debtDoc = await db.collection('debts').doc(debtID).get();

            if (!debtDoc.exists)
                res.status(422).send({error: 'Gæld kunne ikke findes.'});

            await db.collection("debts").doc(debtID).delete();

            categoryDebts = await db.collection("categoryDebts")
                .where("debtID", "==", debtID)
                .get();
        } catch (err) {
            res.status(401).send({error: 'Sletning af gæld fejlede.'})
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
            const categoryDebtDoc = categoryDebts.filter((obj) => {
                return obj.data().categoryID === categoryDoc.id;
            });

            const returnAmountsPromise = categoryDoc.ref.update({
                amount: (categoryDoc.data().amount + categoryDebtDoc.data().amount)
            }).catch(() => res.status(422)
                .send({error: 'Fejl opstod under gældssletningen'}));

            returnAmountsPromises.push(returnAmountsPromise);
            returnAmountsPromises.push(categoryDebtDoc.ref.delete());
        });

        await Promise.all(returnAmountsPromises);
        res.status(200).send({success: true});
    });
};
