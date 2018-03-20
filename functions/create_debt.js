const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.name || !req.body.totalAmount || !req.body.budgetID)
                    return res.status(422).send({error: 'Fejl i indtastning.'});

                if (!req.body.expirationDate || Date.now() >= req.body.expirationDate.toDate())
                    return res.status(422).send({error: 'Ugyldig udløbsdato.'});

                if(!req.body.categories.length || req.body.categories.length > 0)
                    return res.status(422).send({error: 'Ingen kategorier valgt.'});

                const name = String(req.body.name);
                const totalAmount = parseInt(req.body.totalAmount);
                const budgetID = String(req.body.budgetID);
                const expirationDate = new Date(req.body.expirationDate);
                //const categories = req.body.categories;

                const db = admin.firestore();

                db.collection('debts').doc().set({
                    name: name,
                    totalAmount: totalAmount,
                    budgetID: budgetID
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke oprette gæld.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
