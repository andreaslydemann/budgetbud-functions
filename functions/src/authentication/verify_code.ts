import admin = require('firebase-admin');
const crypto = require('crypto');

module.exports = async function (req, res) {
    if (!req.body.cprNumber || !req.body.code)
        return res.status(400).send({error: 'Fejl i indtastning.'});

    const cprNumber = String(req.body.cprNumber);
    const code = String(req.body.code);

    let user;
    try {
        user = await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: 'Bruger er ikke registreret.'});
    }

    if (user.disabled === true)
        return res.status(400).send({error: 'Bruger er deaktiveret.'});

    const db = admin.firestore();

    const userDoc = await db.collection("users").doc(cprNumber).get();

    if (!userDoc.exists)
        return res.status(400).send({error: 'Bruger er ikke registreret.'});

    const hash = crypto.pbkdf2Sync(code, userDoc.data().codeSalt,
        10000, 128, 'sha512').toString('hex');

    if (userDoc.data().codeHash !== hash) {
        const failedSignIns = userDoc.data().failedSignIns + 1;

        if (failedSignIns >= 3) {
            admin.auth().updateUser(cprNumber, {
                disabled: true
            });
        }

        userDoc.ref.update({failedSignIns});
        return res.status(400).send({error: 'Pinkode er forkert.'});
    }

    userDoc.ref.update({failedSignIns: 0});

    const token = await admin.auth().createCustomToken(cprNumber);
    res.send({token: token})
};
