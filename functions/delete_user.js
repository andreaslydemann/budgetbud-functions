const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.token) {
        return res.status(411).send({error: 'Token ikke modtaget.'});
    }

    admin.auth().verifyIdToken(req.body.token)
        .then((decodedToken) => {
            const uid = decodedToken.uid;

            admin.auth().deleteUser(uid)
                .then(() => {
                    const db = admin.firestore();
                    const ref = db.collection("users").doc(uid);

                    ref.remove().then(() => {res.status(200).send()});
                })
                .catch(err => res.status(422).send({error: 'Sletning fejlede.'}));
        }).catch(err => res.status(422).send({error: 'Token kunne ikke verificeres.'}));
};
