const express = require('express');
const port = 3000;
const {currencies} = require("../utils/fetch-currency.js");
const {publisher} = require("../amqp/publisher.js");
const {consumer} = require("../amqp/consumer.js");

var app = express();

// Start consumer
consumer();

app.get('/publish', (req, res) => {
    currencies.eur().then((value) => {
        publisher(value); // Send the value to rabbitmq queue
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ eur: value }));
    });
});

app.get('/subscribe', (req, res) => {
    res.send("TODO: serviceWorker registration");
});

app.get('/', (req, res) => {
    res.send("test");
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});