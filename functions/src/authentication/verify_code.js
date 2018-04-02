const admin = require('firebase-admin');
const crypto = require('crypto');

module.exports = function (req, res) {
    if (!req.body.cprNumber || !req.body.code)
        return res.status(400).send({error: 'Forkert indtastning.'});

    const cprNumber = String(req.body.cprNumber);
    const code = String(req.body.code);

    admin.auth().getUser(cprNumber)
        .then((user) => {
            if (user.disabled === true)
                return res.status(400).send({error: 'Bruger er deaktiveret.'});

            const db = admin.firestore();
            const ref = db.collection("users").doc(cprNumber);

            ref.get()
                .then((doc) => {
                    if (!doc.exists)
                        return res.status(400).send({error: 'Bruger er ikke registreret.'});

                    const hash = crypto.pbkdf2Sync(code, doc.data().codeSalt,
                        10000, 128, 'sha512').toString('hex');

                    if (doc.data().codeHash !== hash) {
                        ref.get().then(doc => {
                            const failedSignIns = doc.data().failedSignIns + 1;

                            if (failedSignIns >= 3) {
                                admin.auth().updateUser(cprNumber, {
                                    disabled: true
                                });
                            }

                            ref.update({failedSignIns});
                        });

                        return res.status(400).send({error: 'Pinkode er forkert.'});
                    }

                    ref.update({failedSignIns: 0});

                    admin.auth().createCustomToken(cprNumber)
                        .then(token => res.send({token: token}))
                });
        })
        .catch(err => res.status(422).send({error: 'Bruger er ikke registreret.'}));
};
