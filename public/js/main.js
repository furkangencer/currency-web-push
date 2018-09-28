let applicationServerPublicKey = null;
const socket = io.connect('https://furkangencer.me/');

socket.on('connect', function() {
    console.log('Connected to server');
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('publicKey', function(msg) {
    applicationServerPublicKey = msg;
});

socket.on('massPushResponse', function(msg) {
    console.log(msg.statusCode + `[${msg.execTime}]`);
});

const pushButton = document.querySelector('.js-push-btn');
const showPushViaServerButton = document.querySelector('.show-push-server-btn');
const showPushViaBrowserButton = document.querySelector('.show-push-browser-btn');
const startMassPushButton = document.querySelector('.start-mass-push-btn');

let isSubscribed = false;
let swRegistration = null;

let options = {
    title: "This is title",
    body: 'Here is a notification body!',
    icon: 'images/push_logo.png',
    image: 'images/push_image.jpg',
    badge: 'images/push_logo.png', // Badges are only being used on mobile. It's used to replace the browser icon that is shown by default.
    vibrate: [100, 50, 100],
    requireInteraction: true,
    renotify: false,
    tag: 'notification-example', // Tag attribute is the grouping key. When creating a notification with a tag and there is already a notification with the same tag visible to the user, the system automatically replaces it without creating a new notification.
    data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
        url: 'https://www.google.com',
        firstButton: 'https://www.apple.com',
        secondButton: 'https://www.tesla.com',
    },
    actions: [
        {action: 'firstButton',title: 'Apple',
            icon: 'images/push_button_icon1.png'},
        {action: 'secondButton', title: 'Tesla',
            icon: 'images/push_button_icon2.png'},
    ]
};

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function initializeUI() {
    pushButton.addEventListener('click', () => {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    showPushViaServerButton.addEventListener('click', () => {
        displayNotificationViaServer(options);
    });

    showPushViaBrowserButton.addEventListener('click', () => {
        displayNotification();
    });

    startMassPushButton.addEventListener('click', () => {
        startMassPush(options);
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then((subscription) => {
            isSubscribed = !(subscription === null);

            if (isSubscribed) {
                console.log('User IS subscribed.', subscription);
                updateSubscriptionOnServer(subscription, false); // Page has just loaded, so we don't want current subscription object to be saved in order to avoid duplicate entries in database
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then((subscription) => {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription, true);

            isSubscribed = true;

            updateBtn();
        })
        .catch((err) => {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then((subscription) => {
            if (subscription) {
                return subscription.unsubscribe();
            }
        })
        .catch((error) => {
            console.log('Error unsubscribing', error);
        })
        .then(() => {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription, saveToDb = false) {

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    if (subscription) {
        if (saveToDb) {
            socket.emit('subscribe', subscription, function (msg) {
                console.log(msg);
            });
        }
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('sw.js')
        .then((swReg) => {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            initializeUI();
        })
        .catch((error) => {
            console.error('Service Worker Registration Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function displayNotification() {
    if (Notification.permission === 'granted') {
        if(swRegistration){
            swRegistration.showNotification('Hello world!', options);
            //Notice the showNotification method is called on the service worker registration object.
            // This creates the notification on the active service worker, so that events triggered by interactions with the notification are heard by the service worker.
        }
    } else if (Notification.permission === "denied") {
        console.log("The user has previously denied push. Can't reprompt.");
    } else {
        console.log("Permission is not granted.");
    }
}

function displayNotificationViaServer(payload="Test") {
    swRegistration.pushManager.getSubscription().then((subscription) => {
        if(subscription){
            socket.emit('triggerPush', { subscription, payload }, function (res) {
                console.log(res);
            })
        }
    });
}

function startMassPush(payload = "Test") {
    socket.emit('massPush', payload, function () {
        console.log("Mass Push triggered");
    })
}