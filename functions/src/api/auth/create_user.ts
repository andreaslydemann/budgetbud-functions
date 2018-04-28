import admin = require('firebase-admin');
const translator = require('../../strings/translator');

module.exports = function (req, res) {
    if (!req.body.cprNumber)
        return res.status(422).send({error: translator.t('errorInEntry')});

    // Format to remove dashes and parentheses
    const cprNumber = String(req.body.cprNumber);

    admin.auth().createUser({uid: cprNumber})
        .then(user => res.send(user))
        .catch(() => res.status(422).send({error: translator.t('userAlreadyRegistered')}));
};
