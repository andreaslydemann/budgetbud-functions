const admin = require('firebase-admin');

module.exports = function (req, res) {
    // Verify that the user provided a phone
    if (!req.body.phone) {
        return res.status(422).send({error: 'Bad Input'});
    }

    // Format the phone number to remove dashes and parentheses
    const phone = String(req.body.phone).replace(/[^\d]/g, "");

    // Create a new user account using that phone number
    // Respond to the user request, saying the account was made
    admin.auth().createUser({uid: phone})
        .then(user => res.send(user))
        .catch(err => res.status(422).send({error: err}));
};