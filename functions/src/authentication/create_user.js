const admin = require('firebase-admin');

module.exports = function (req, res) {
    if (!req.body.cprNumber)
        return res.status(422).send({error: 'Forkert indtastning.'});

    // Format to remove dashes and parentheses
    const cprNumber = String(req.body.cprNumber);

    admin.auth().createUser({uid: cprNumber})
        .then(user => res.send(user))
        .catch(err => res.status(422).send({error: 'Bruger findes allerede.'}));
};
