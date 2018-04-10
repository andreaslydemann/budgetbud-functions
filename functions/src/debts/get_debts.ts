import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const dateHelper = require('../helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        try {
            await admin.auth().verifyIdToken(token);
        } catch (err) {
            res.status(401).send({error: "Brugeren kunne ikke verificeres."});
        }

        if (!req.query.budgetID)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const budgetID = String(req.query.budgetID);
        const db = admin.firestore();

        let querySnapshot;
        try {
            querySnapshot = await db.collection("debts")
                .where("budgetID", "==", budgetID)
                .get();
        } catch (err) {
            res.status(422).send({error: 'Kunne ikke hente gælden.'});
        }

        const debtArray = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            data.expirationDate = String(
                dateHelper.toDateString(new Date(doc.data().expirationDate)));

            debtArray.push({id: doc.id, debtData: data});
        });

        res.status(200).send(debtArray);
    });
};
