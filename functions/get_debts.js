const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.budgetID)
                    return res.status(400).send({error: 'Fejl i anmodningen.'});

                const budgetID = String(req.query.budgetID);
                const db = admin.firestore();

                let debtArray = [];

                db.collection("debts").where("budgetID", "==", budgetID)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            debtArray.push({id: doc.id, data: doc.data()});
                        });

                        res.status(200).send(debtArray)
                    })
                    .catch(err => res.status(422).send({error: 'Kunne ikke hente gælden.'}));
            })
            .catch(err => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    });
};
