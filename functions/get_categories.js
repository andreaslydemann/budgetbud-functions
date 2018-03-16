const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                const db = admin.firestore();
                const budgetID = String(req.body.budgetID);
                let categoryArray = [];
                db.collection("categories").where("budgetID", "==", budgetID)
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(doc) {
                            console.log("Data: " + doc.data());
                            categoryArray.push(doc.data());
                            console.log("Category array: " + categoryArray);
                        });
                        res.status(200).send(categoryArray)
                            .catch(err => res.status(422)
                                .send({error: 'Hentning af et budget dokument fejlede.'}));
                    })
                    .catch(function(error) {
                        console.log("Kunne ikke hente budgettet: ", error);
                    });

            })

            .catch(err => res.status(401).send({error: err}));
    })
};
