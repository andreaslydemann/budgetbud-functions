import admin = require('firebase-admin');
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});

module.exports = function (req, res) {
    cors(req, res, async () => {
        if (!req.query.cronKey)
            return res.status(400).send({error: 'Fejl i anmodningen.'});

        const callersCronKey = req.query.cronKey;
        const cronKey = functions.config().cron.key;

        if (callersCronKey === cronKey){
            const db = admin.firestore();
            let budgetAlarms, categoryAlarms;

            try {
                budgetAlarms = await db.collection("budgetAlarms").get();
                categoryAlarms = await db.collection("categoryAlarms").get();
            } catch (err) {
                res.status(422).send({error: 'Kunne ikke hente alarmer.'});
            }

            budgetAlarms.docs.forEach((doc) => {
                doc.ref.update({
                    hasTriggered: false
                })
                    .catch(() => res.status(422)
                        .send({error: 'Budgetalarmernes alarmer kunne ikke nulstilles.'}));
            });

            categoryAlarms.docs.forEach((doc) => {
                doc.ref.update({
                    hasTriggered: false
                })
                    .catch(() => res.status(422)
                        .send({error: 'Kategorialarmernes alarmer kunne ikke nulstilles.'}));
            });
            res.status(200).send({success: true});
        } else {
            console.log(cronKey);
            console.log(callersCronKey);
            res.status(422).send({error: 'Cron key matchede ikke.'});
        }
    })
};
