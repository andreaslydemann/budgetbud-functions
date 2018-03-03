const admin = require('firebase-admin');

module.exports = function (req, res) {
    // Verify that the user provided a cprNumber
    if (!req.body.cprNumber) {
        return res.status(422).send({error: 'Forkert indtastning.'});
    }

    // Format to remove dashes and parentheses
    const cprNumber = String(req.body.cprNumber);

    // Create a new user account using that cpr-number
    // Respond to the user request, saying the account was made
    admin.auth().createUser({uid: cprNumber})
        .then(user => res.send(user))
        .catch(err => res.status(422).send({error: 'Bruger findes allerede.'}));
};
