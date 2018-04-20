// import admin = require('firebase-admin');
//
// const functions = require('firebase-functions');
// const cors = require('cors')({origin: true});
//
// module.exports = function (req, res) {
//     cors(req, res, async () => {
//         if (!req.query.cronKey)
//             return res.status(400).send({error: 'Fejl i anmodningen.'});
//
//         const callersCronKey = req.query.cronKey;
//         const cronKey = functions.config().cron.key;
//         const messages = [];
//
//         if (callersCronKey !== cronKey)
//             res.status(422).send({error: 'Cron key matchede ikke.'});
//
//         const users = await db.collection("users").doc(cprNumber).get()
//             .catch(() => res.status(422).send({error: "Kunne ikke finde brugeren."}));
//
//         users.forEach((user) => {
//             const pushToken = user.data().pushToken;
//
//             if(pushToken) {
//                 messages.push({
//                     to: pushToken,
//                     body: "Du har overskredet dit budget."
//                 })
//             }
//         })
//
//         const {data} = await axios
//             .post(`https://exp.host/--/api/v2/push/send`, {debtID: debtID});
//     })
// };
