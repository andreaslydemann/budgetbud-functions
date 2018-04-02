const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.budgetID)
                    return res.status(400).send({error: 'Intet gæld er angivet.'});

                const budgetID = String(req.body.budgetID);

                const db = admin.firestore();
                const budgetRef = db.collection('budgets').doc(budgetID);

                budgetRef.get().then((doc) => {
                    if (doc.exists) {
                        budgetRef.delete()
                            .then(() => {
                                db.collection("categories").where("budgetID", "==", budgetID)
                                    .get()
                                    .then((querySnapshot) => {
                                        querySnapshot.forEach((doc) => {
                                            doc.ref.delete();
                                        });

                                        res.status(200).send({success: true})
                                    });
                            })
                            .catch(() => res.status(422)
                                .send({error: 'Sletning af budget fejlede.'}));
                    } else {
                        res.status(422).send({error: 'Budgettet kunne ikke findes.'})
                    }
                }).catch(() => res.status(401)
                    .send({error: 'Hentning af budget fejlede.'}));
            })
            .catch(() => res.status(401)
                .send({error: "Brugeren kunne ikke verificeres."}));
    });
};
