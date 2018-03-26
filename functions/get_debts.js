const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const dateHelper = require('./helpers/date_helper');

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.budgetID)
                    return res.status(400).send({error: 'Fejl i anmodningen.'});

                const budgetID = String(req.query.budgetID);
                const db = admin.firestore();

                db.collection("debts").where("budgetID", "==", budgetID)
                    .get()
                    .then((querySnapshot) => {
                        let debtArray = [];

                        querySnapshot.forEach((doc) => {
                            const data = doc.data();

                            data.expirationDate = String(
                                dateHelper.toDateString(new Date(doc.data().expirationDate)));

                            debtArray.push({id: doc.id, debtData: data});
                        });

                        res.status(200).send(debtArray);
                    })
                    .catch(() => res.status(422).send({error: 'Kunne ikke hente gælden.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    });
};
