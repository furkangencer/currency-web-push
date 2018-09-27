const webpush = require('web-push');
const vapidKeys = require("./../server/vapid/vapid.json");

// Using VAPID also lets you avoid the FCM-specific steps for sending a push message. You no longer need a Firebase project, a gcm_sender_id, or an Authorization header.
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const triggerPush = (subscription, dataToSend) => {
    var hrstart = process.hrtime();
    // (webpush.sendNotification will automatically encrypt the payload for you, so if you use sendNotification you don't need to worry about it).
    return new Promise((resolve, reject) => {
        return webpush.sendNotification(subscription, JSON.stringify(dataToSend))
            .then((res) => {
                var hrend = process.hrtime(hrstart);
                resolve('Success: ' + res.statusCode + `[${Math.ceil(hrend[1] / 1000000)}ms]`);
            })
            .catch((err) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    var hrend = process.hrtime(hrstart);
                    resolve('Subscription is no longer valid: ' + err.statusCode + `[${Math.ceil(hrend[1] / 1000000)}ms]`);
                    //TODO: db'den silme işlemi yapılmalı
                    // return deleteSubscriptionFromDatabase(subscription._id);
                } else {
                    reject(err)
                }
            });
    });
};

module.exports = {
    publicKey: vapidKeys.publicKey,
    triggerPush
};
