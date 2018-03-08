const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.code) {
        return res.status(400).send({error: 'Forkert indtastning.'});
    }

    const cprNumber = String(req.body.cprNumber);
    const code = parseInt(req.body.code);

    admin.auth().getUser(cprNumber)
        .then(() => {
            const db = admin.firestore();
            const ref = db.collection("users").doc(cprNumber);

            ref.get()
                .then((doc) => {
                    if (!doc.exists)
                        return res.status(400).send({error: 'Bruger er ikke registreret.'});

                    const user = doc.data();

                    if (user.code !== code) {
                        //ref.update({codeValid: false});
                        return res.status(400).send({error: 'Pinkode er forkert.'});
                    }

                    admin.auth().createCustomToken(cprNumber)
                        .then(token => res.send({token: token}))
                });
        })
        .catch(err => res.status(422).send({error: 'Bruger er ikke registreret.'}));
};
