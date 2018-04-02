const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.query.budgetID)
                    return res.status(400
                    ).send({error: 'Fejl i anmodningen.'});

                const db = admin.firestore();
                const budgetID = String(req.query.budgetID);
                console.log("BudgetID: " + budgetID);

                db.collection('budgets').doc(budgetID).get()
                    .then(doc => {
                            if (!doc.exists)
                                return res.status(400).send({error: 'Budgettet eksisterer ikke.'});

                            res.status(200).send({budgetData: doc.data()});
                        }
                    )
                    .catch(function (error) {
                        console.log("Kunne ikke hente budgettet: ", error);
                    })
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
