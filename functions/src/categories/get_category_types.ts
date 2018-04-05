import admin = require('firebase-admin');

const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                const db = admin.firestore();

                db.collection("categoryTypes")
                    .get()
                    .then((querySnapshot) => {
                        const categoryTypeArray = [];

                        querySnapshot.forEach((doc) => {
                            categoryTypeArray.push(doc.data().name);
                        });

                        res.status(200).send(categoryTypeArray);
                    })
                    .catch(() => res.status(422).send({error: 'Kunne ikke hente kategorityper.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    })
};
