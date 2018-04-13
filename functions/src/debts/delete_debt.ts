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
        let querySnapshot;
        try {
            debtDoc = await db.collection('debts').doc(debtID).get();

            if (!debtDoc.exists)
                res.status(422).send({error: 'Gæld kunne ikke findes.'});

            await db.collection("debts").doc(debtID).delete();

            querySnapshot = await db.collection("categoryDebts")
                .where("debtID", "==", debtID)
                .get();
        } catch (err) {
            res.status(401).send({error: 'Sletning af gæld fejlede.'})
        }

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

        await Promise.all(returnAmountsPromises);
        res.status(200).send({success: true});
    });
};
