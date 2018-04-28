import admin = require('firebase-admin');

const cors = require('cors')({origin: true});
const translator = require('../../strings/translator');
const tokenHelper = require('../../helpers/id_token_helper');

module.exports = function (req, res) {
    cors(req, res, async () => {
            await tokenHelper.verifyToken(req, res);

            // Verify that the user provided an income
            if (!req.body.userID)
                return res.status(422).send({error: translator.t('errorInRequest')});

            const db = admin.firestore();
            const userID = String(req.body.userID);
            const eBankingAccIDs = req.body.eBankingAccIDs;
            const linkAccountsPromises = [];
            const deleteAccountsPromises = [];

            // Create new accounts using the userID and accountID from the eBankingData
            let linkedAccounts;
            try {
                linkedAccounts = await db.collection('linkedAccounts')
                    .where("userID", "==", userID)
                    .get();
            } catch (err) {
                res.status(422).send({error: translator.t('accountsNotFound')})
            }

            linkedAccounts.forEach((account) => {
                const deleteAccountsPromise = account.ref.delete()
                    .catch(() => res.status(422)
                        .send({error: translator.t('accountsUnlinkFailed')}));
                deleteAccountsPromises.push(deleteAccountsPromise)
            });

            await Promise.all(deleteAccountsPromises);

            if (eBankingAccIDs.length > 0) {
                eBankingAccIDs.forEach(accountDoc => {
                    const id = String(accountDoc);
                    const linkAccountPromise = db.collection('linkedAccounts').doc(id).set({
                        userID
                    })
                        .catch(err => res.status(422)
                            .send({error: translator.t('accountsCreationFailed')}));
                    linkAccountsPromises.push(linkAccountPromise)
                })
            }
            await Promise.all(linkAccountsPromises);
            res.status(200).send({success: true})
        }
    )
};
