const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const port = 3000;

const {currencies} = require("../utils/fetch-currency.js");
const {publisher} = require("../amqp/publisher.js");
const {consumer} = require("../amqp/consumer.js");
const {publicKey, triggerPush} = require("../utils/push.js");
const {PushSubscription} = require("../db/models/subscriptions.js");

let app = express();

let server = http.Server(app);
let io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Start consumer
consumer();

let currenciesJsonOutput = {
    eur: "",
    usd: ""
};
app.get('/publish', async (req, res) => {
    await currencies(1, 'EUR', 'TRY').then((value) => {
        publisher(value); // Send the value to queue
        currenciesJsonOutput.eur = value;
    });
    await currencies(1, 'USD', 'TRY').then((value) => {
        publisher(value); // Send the value to queue
        currenciesJsonOutput.usd = value;
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(currenciesJsonOutput, null, 3));
});

io.on('connection', (socket) => {
    socket.emit('publicKey', publicKey);

    socket.on('triggerPush', (message, callback) => {
        console.log('triggerPush', message);

        triggerPush(message.subscription, message.payload);

        //Acknowledgement - Tell the client that server has received the message.
        callback(message); //callback('This is from the server');
    });

    socket.on('massPush', (payload, callback) => {
        console.log('\n=======Mass Push has started========');
        PushSubscription.find({statusCode: {$nin : [410, 404]}}).then((docs) => {

            docs.forEach((doc) => {
                triggerPush(JSON.parse(doc.subscription), payload)
                    .then((res) => {
                        socket.emit('massPushResponse', res);
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log('Error: ', err);
                    });
            })
        });

        // callback(payload); //callback('This is from the server');
    });

    socket.on('subscribe', (subscription, callback) => {
        // console.log('subscribe', subscription);

        let pushSubscription = new PushSubscription({
            subscription : JSON.stringify(subscription)
        });

        pushSubscription.save().then((doc) => {
            console.log('Subscription details have been saved', doc);
        }, (e) => {
            console.log('Error', e);
        });
    })
});

// WARNING: app.listen() will NOT work here because of socket.io
server.listen(port, () => {
    console.log(`Started on port ${port}`);
});