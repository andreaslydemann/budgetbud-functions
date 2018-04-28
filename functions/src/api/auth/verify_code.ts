import admin = require('firebase-admin');
const crypto = require('crypto');
const translator = require('../../strings/translator');

module.exports = async function (req, res) {
    if (!req.body.cprNumber || !req.body.code)
        return res.status(400).send({error: translator.t('errorInEntry')});

    const cprNumber = String(req.body.cprNumber);
    const code = String(req.body.code);

    let user;
    try {
        user = await admin.auth().getUser(cprNumber);
    } catch (err) {
        res.status(422).send({error: translator.t('userNotRegistered')});
    }

    if (user.disabled === true)
        return res.status(400).send({error: translator.t('userDeactivated')});

    const db = admin.firestore();

    const userDoc = await db.collection("users").doc(cprNumber).get();

    if (!userDoc.exists)
        return res.status(400).send({error: translator.t('userNotRegistered')});

    const hash = crypto.pbkdf2Sync(code, userDoc.data().codeSalt,
        10000, 128, 'sha512').toString('hex');

    if (userDoc.data().codeHash !== hash) {
        const failedSignIns = userDoc.data().failedSignIns + 1;

        if (failedSignIns >= 3) {
            await admin.auth().updateUser(cprNumber, {
                disabled: true
            });
        }

        await userDoc.ref.update({failedSignIns});
        return res.status(400).send({error: translator.t('codeInvalid')});
    }

    await userDoc.ref.update({failedSignIns: 0});

    const token = await admin.auth().createCustomToken(cprNumber);
    res.send({token: token})
};
