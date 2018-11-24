const webpush = require('web-push');
const vapidKeys = require("./../server/vapid/vapid.json");
const {PushSubscription} = require("../db/models/subscriptions.js");

// Using VAPID also lets you avoid the FCM-specific steps for sending a push message. You no longer need a Firebase project, a gcm_sender_id, or an Authorization header.
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const triggerPush = (subscription, dataToSend) => {
    let hrstart = process.hrtime();
    // (webpush.sendNotification will automatically encrypt the payload for you, so if you use sendNotification you don't need to worry about it).
    return new Promise((resolve, reject) => {
        return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
            .then((res) => {
                let hrend = process.hrtime(hrstart);

                PushSubscription.findOneAndUpdate({endpoint : subscription.endpoint}, {statusCode : res.statusCode}, {new:true}).then((doc) => { });

                resolve({statusCode : res.statusCode, execTime : `${Math.ceil(hrend[1] / 1000000)}ms`});
            })
            .catch((err) => {
                if (err.statusCode === 410 || err.statusCode === 404) { // Subscription is no longer valid
                    let hrend = process.hrtime(hrstart);

                    PushSubscription.findOneAndDelete( {endpoint : subscription.endpoint} ).then((doc) => { });

                    resolve({statusCode : err.statusCode, execTime : `${Math.ceil(hrend[1] / 1000000)}ms`});
                } else {
                    reject(err)
                }
            });
    });
};

module.exports = {
    PushSubscription,
    publicKey: vapidKeys.publicKey,
    triggerPush
};
