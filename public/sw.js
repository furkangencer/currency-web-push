/* eslint-env browser, serviceworker, es6 */

'use strict';

self.addEventListener('push', (event) => {
    let notification =  event.data.json();
    console.log('[Service Worker] Push Received: ', notification);

    event.waitUntil(self.registration.showNotification(notification.title, notification));
});

self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click Received.');

    let notification = event.notification;
    let primaryKey = notification.data.primaryKey;
    let action = event.action;
    let url = notification.data.url;

    // console.log(notification);
    if (action === 'firstButton') {
        url = notification.data.firstButton;
    } else if (action === 'secondButton') {
        url = notification.data.secondButton;
    }

    notification.close();
    event.waitUntil(clients.openWindow(url));
});

self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('Subscription expired');
    event.waitUntil(
        self.registration.pushManager.subscribe({ userVisibleOnly: true })
            .then((subscription) => {
                console.log('Subscribed after expiration', subscription.endpoint);
                // return fetch('register', {
                //     method: 'post',
                //     headers: {
                //         'Content-type': 'application/json'
                //     },
                //     body: JSON.stringify({
                //         endpoint: subscription.endpoint
                //     })
                // });
            })
    );
});

self.addEventListener('notificationclose', function(event) {
    let notification = event.notification;
    let primaryKey = notification.data.primaryKey;

    console.log('Closed notification: ' + primaryKey);
});