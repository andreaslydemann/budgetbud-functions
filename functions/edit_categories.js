const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, () => {
        const token = req.get('Authorization').split('Bearer ')[1];
        admin.auth().verifyIdToken(token)
            .then(() => {
                // Verify that the user provided category data
                if (!req.query.budgetID)
                    return res.status(422).send({error: 'Budget-ID ikke modtaget.'});

                const totalCategories = String(req.body.category.length);
                const budgetID = String(req.query.budgetID);
                const db = admin.firestore();

                for (let i = 0; i < totalCategories; i++) {
                    let categoryAmount = String(req.body.category[i].amount);
                    db.collection('categories').where("budgetID", "==", budgetID).update({
                        amount: categoryAmount,
                    })
                        .then(() => res.status(200).send({success: true}))
                        .catch(err => res.status(422)
                            .send({error: 'Kunne ikke opdatere kategori.'}));
                }
            })
            .catch(err => res.status(401).send({error: err}));
    })
};
