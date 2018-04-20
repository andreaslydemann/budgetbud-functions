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

        let querySnapshot;
        try {
            querySnapshot = await db.collection("categoryTypes").get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente kategorityper.'});
        }

        const categoryTypeArray = [];

        querySnapshot.forEach((doc) => {
            categoryTypeArray.push({id: doc.id, name: doc.data().name});
        });

        res.status(200).send(categoryTypeArray);
    })
};
