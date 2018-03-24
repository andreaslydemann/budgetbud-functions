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

                db.collection("categories")
                    .where("budgetID", "==", budgetID)
                    .get()
                    .then((querySnapshot) => {
                        console.log(querySnapshot);

                        let categoryArray = [];

                        querySnapshot.forEach((doc) => {
                            if (doc.data().amount > 0)
                                categoryArray.push(doc.data());
                        });

                        res.status(200).send(categoryArray);
                    })
                    .catch(() => res.status(422).send({error: 'Kunne ikke hente kategorier.'}));
            })
            .catch(() => res.status(401).send({error: "Brugeren kunne ikke verificeres."}));
    })
};
