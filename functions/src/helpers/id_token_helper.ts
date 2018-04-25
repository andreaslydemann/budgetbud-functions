const verifyToken = async function (req) {
    const token = req.get('Authorization').split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);
};

module.exports = {
    verifyToken
};
