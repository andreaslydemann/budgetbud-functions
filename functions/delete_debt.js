const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.debtID)
                    return res.status(400).send({error: 'Intet gæld er angivet.'});

                const debtID = String(req.body.debtID);

                const db = admin.firestore();
                const docRef = db.collection('debts').doc(debtID);

                docRef.get().then((doc) => {
                    if (doc.exists) {
                        db.collection("debts").doc(debtID).delete()
                            .then(() => {
                                db.collection("categoryDebt").where("debtID", "==", debtID)
                                    .get()
                                    .then((querySnapshot) => {
                                        querySnapshot.forEach((doc) => {
                                            doc.ref.delete();
                                        });

                                        res.status(200).send({success: true})
                                    })
                            })
                            .catch(() => res.status(422).send({error: 'Sletning af gælden fejlede.'}));
                    } else {
                        res.status(422).send({error: 'Gæld kunne ikke findes.'})
                    }
                }).catch(() => res.status(401).send({error: 'Ukendt fejl opstod.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    });
};
