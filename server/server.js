const express = require('express');
const port = 3000;
const {currencies} = require("../utils/fetch-currency.js");
const {publisher} = require("../amqp/publisher.js");
const {consumer} = require("../amqp/consumer.js");

var app = express();

// Start consumer
consumer();

let currenciesJsonOutput = {
    eur: "",
    usd: ""
};
app.get('/publish', async (req, res) => {
    await currencies(1, 'EUR', 'TRY').then((value) => {
        publisher(value); // Send the value to rabbitmq queue
        currenciesJsonOutput.eur = value;
    });
    await currencies(1, 'USD', 'TRY').then((value) => {
        publisher(value); // Send the value to rabbitmq queue
        currenciesJsonOutput.usd = value;
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(currenciesJsonOutput, null, 3));
});

app.get('/subscribe', (req, res) => {
    //TODO: serviceWorker registration
    res.send("SW");
});

app.get('/', (req, res) => {
    res.send("test");
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});