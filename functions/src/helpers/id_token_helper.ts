const translator = require('../strings/translator');

const verifyToken = async function (req, res) {
    try {
        const token = req.get('Authorization').split('Bearer ')[1];
        await admin.auth().verifyIdToken(token);
    } catch (err) {
        res.status(401).send({error: translator.t('userNotVerified')});
    }
};

module.exports = {
    verifyToken
};
