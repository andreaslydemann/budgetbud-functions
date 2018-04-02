const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.userID)
                    return res.status(400
                    ).send({error: 'Fejl i anmodningen.'});

                const db = admin.firestore();
                const userID = String(req.query.userID);

                db.collection("budgets").where("userID", "==", userID)
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                            res.status(200).send({id: doc.id})
                                .catch(() => res.status(422)
                                    .send({error: 'Hentning af et budget fejlede.'}));
                        });
                    })
                    .catch(function(error) {
                        console.log("Kunne finde budgettet: ", error);
                    });
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
