const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                const db = admin.firestore();
                // const userID = String(req.body.userID);
                const userID = String(req.body.userID);
                db.collection("budgets").where("userID", "==", userID)
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                            res.status(200).send(doc.data())
                                .catch(err => res.status(422)
                                    .send({error: 'Hentning af et budget dokument fejlede.'}));
                        });
                    })
                    .catch(function(error) {
                        console.log("Kunne ikke hente budgettet: ", error);
                    });

            })

            .catch(err => res.status(401).send({error: err}));
    })
};
