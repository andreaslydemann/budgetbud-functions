import admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided an income
                if (!req.body.eBankingAccID || !req.body.userID)
                    return res.status(422).send({error: 'Fejl i indtastningen.'});

                const db = admin.firestore();
                const userID = String(req.body.userID);
                const eBankingAccID = String(req.body.eBankingAccID);

                // Create a new account using the userID and accountID from the eBankingData
                db.collection('accounts').doc().set({
                    userID,
                    eBankingAccID
                })
                    .then(() => res.status(200).send({success: true}))
                    .catch(err => res.status(422)
                        .send({error: 'Kunne ikke oprette kontoen.'}));

            })
            .catch(err => res.status(401).send({error: err}));
    })
};
