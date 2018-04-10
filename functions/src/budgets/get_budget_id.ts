import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                const db = admin.firestore();
                const userID = String(req.query.userID);

                db.collection('budgets')
                    .where("userID", "==", userID)
                    .get()
                    .then(querySnapshot => {
                            if (!querySnapshot.docs[0].exists)
                                return res.status(400).send({error: 'Budgettet eksisterer ikke.'});

                            res.status(200).send(querySnapshot.docs[0].id);
                        }
                    )
                    .catch(() => res.status(422).send({error: "Kunne ikke finde budgettet."}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
