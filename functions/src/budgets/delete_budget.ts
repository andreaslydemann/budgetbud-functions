import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../strings/translator');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: translator.t('userNotVerified')});
        }

        if (!req.body.budgetID)
            return res.status(400).send({error: translator.t('noBudgetID')});

        const budgetID = String(req.body.budgetID);

        const db = admin.firestore();
        const budgetRef = db.collection('budgets').doc(budgetID);

        let budgetDoc;
        try {
            budgetDoc = await budgetRef.get()
        } catch (err) {
            res.status(401)
                .send({error: translator.t('budgetFetchFailed')});
        }

        if (!budgetDoc.exists)
            res.status(422).send({error: translator.t('budgetNotFound')});

        try {
            await budgetRef.delete();
        } catch (err) {
            res.status(422).send({error: translator.t('budgetDeletionFailed')});
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
