import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.userID)
                    return res.status(400).send({error: 'Fejl i anmodningen.'});

                const userID = String(req.query.userID);
                const db = admin.firestore();

                db.collection("linkedAccounts")
                    .where("userID", "==", userID)
                    .get()
                    .then((querySnapshot) => {
                        const accountsArray = [];

                        querySnapshot.forEach((doc) => {
                            accountsArray.push(doc.id);
                        });

                        res.status(200).send(accountsArray);
                    })
                    .catch(() => res.status(422).send({error: 'Kunne ikke hente konti.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    })
};
