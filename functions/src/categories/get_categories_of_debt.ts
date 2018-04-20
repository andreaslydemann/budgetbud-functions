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

        if (!req.query.debtID)
            return res.status(400).send({error: 'Fejl i anmodning.'});

        const debtID = String(req.query.debtID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categoryDebts").where("debtID", "==", debtID).get();
        } catch (err) {
            res.status(422).send({error: 'Hentning af kategorier fejlede.'})
        }

        const categories = [];

        querySnapshot.forEach((doc) => {
            categories.push({
                categoryID: doc.data().categoryID,
                amount: doc.data().amount
            });
        });

        res.status(200).send(categories);
    })
};
