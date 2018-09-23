const request = require("request-promise"); // "request" module is defined as a peer-dependency and thus has to be installed separately.
const cheerio = require("cheerio");  // Basically jQuery for node.js

const currencies = (amount, from, to) => {
    return new Promise( (resolve, reject) => {

        let options = {
            uri: 'https://www.x-rates.com/calculator/?',
            qs: {
                amount,
                from,
                to
            },
            headers: {
                "User-Agent": "Request-Promise"
            },
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        // By default, http response codes other than 2xx will cause the promise to be rejected. This can be overwritten by setting options.simple = false.
        request(options)
            .then(function ($) {
                let value = $(".ccOutputRslt").text();
                if(value === "" || value === undefined) {
                    return Promise.reject("No string found"); // Burası catch bloğuna düşmesini sağlayacak
                }
                resolve(value);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

/*currencies(1, 'EUR', 'TRY').then((val) => {
    console.log(val);
}).catch( (err) => {
    console.log(err);
});*/
module.exports = {currencies};