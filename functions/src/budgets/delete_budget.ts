import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."});
        }

        if (!req.body.budgetID)
            return res.status(400).send({error: 'Intet budgetID angivet.'});

        const budgetID = String(req.body.budgetID);

        const db = admin.firestore();
        const budgetRef = db.collection('budgets').doc(budgetID);

        let budgetDoc;
        try {
            budgetDoc = await budgetRef.get()
        } catch (err) {
            res.status(401)
                .send({error: 'Hentning af budget fejlede.'});
        }

        if (!budgetDoc.exists)
            res.status(422).send({error: 'Budgettet kunne ikke findes.'});

        try {
            await budgetRef.delete();
        } catch (err) {
            res.status(422).send({error: 'Sletning af budget fejlede.'});
        }

        const querySnapshot = await db.collection("categories").where("budgetID", "==", budgetID).get();
        const deletionPromises = [];

        querySnapshot.forEach(doc => {
            const deletionPromise = doc.ref.delete();
            deletionPromises.push(deletionPromise);
        });

        await Promise.all(deletionPromises);

        res.status(200).send({success: true})
    });
};
