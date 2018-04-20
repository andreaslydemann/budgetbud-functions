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

        const db = admin.firestore();
        const userID = String(req.query.userID);

        let querySnapshot;
        try {
            querySnapshot = await db.collection('budgets')
                .where("userID", "==", userID)
                .get();
        } catch (err) {
            res.status(422).send({error: "Kunne ikke finde budgettet."});
        }

        if (!querySnapshot.docs[0])
            return res.status(400).send({error: 'Budgettet eksisterer ikke.'});

        res.status(200).send(querySnapshot.docs[0].id);
    })
};
