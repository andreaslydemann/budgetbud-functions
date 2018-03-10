const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];

        admin.auth().verifyIdToken(token)
            .then(() => {
                if (!req.body.cprNumber)
                    return res.status(400).send({error: 'CPR-nummer ikke modtaget.'});

                const cprNumber = String(req.body.cprNumber);

                admin.auth().deleteUser(cprNumber)
                    .then(() => {
                        const db = admin.firestore();

                        db.collection("users").doc(cprNumber).delete()
                            .then(() => res.status(200).send({success: true}))
                            .catch(err => res.status(422)
                                .send({error: 'Bruger blev slettet, men tilknyttet data blev ikke.'}));
                    })
                    .catch(err => res.status(422).send({error: 'Sletning af bruger fejlede.'}));
            })
            .catch(err => res.status(401).send({error: err}));
    });
};
