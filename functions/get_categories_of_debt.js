const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.debtID)
                    return res.status(400).send({error: 'Fejl i anmodning.'});

                const debtID = String(req.query.debtID);
                const db = admin.firestore();

                db.collection("categoryDebt").where("debtID", "==", debtID)
                    .get()
                    .then((querySnapshot) => {
                        const categories = [];

                        querySnapshot.forEach((doc) => {
                            categories.push(doc.data().categoryID);
                        });

                        res.status(200).send(categories);
                    })
                    .catch(() => res.status(422)
                        .send({error: 'Hentning af kategorier fejlede.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    })
};
