const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.code) {
        return res.status(422).send({error: 'CPR-nummer og pinkode skal angives.'});
    }

    const cprNumber = String(req.body.cprNumber);
    const code = parseInt(req.body.code);

    admin.auth().getUser(cprNumber)
        .then(() => {
            const db = admin.firestore();
            const ref = db.collection("users").doc(cprNumber);

            ref.get().then(function (doc) {
                if (!doc.exists)
                    return res.status(422).send({error: 'Bruger ikke fundet.'});

                const user = doc.data();

                if (user.code !== code) {
                    //ref.update({codeValid: false});
                    return res.status(422).send({error: 'Pinkode er forkert.'});
                }

                admin.auth().createCustomToken(cprNumber)
                    .then(token => res.send({token: token}))
                    .catch()
            });
        })
        .catch(err => res.status(422).send({error: err}))
};
