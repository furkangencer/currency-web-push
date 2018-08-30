const request = require("request-promise"); // "request" module is defined as a peer-dependency and thus has to be installed separately.
const cheerio = require("cheerio");  // Basically jQuery for node.js

const currencies = {
    eur: function () {
        let options = {
            uri: 'https://tr.investing.com/currencies/eur-try', //
            headers: {
                "User-Agent": "node.js"
            },
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        // By default, http response codes other than 2xx will cause the promise to be rejected. This can be overwritten by setting options.simple = false.
        return request(options)
            .then(function ($) {
                let value = $("#last_last").text();
                if(value === "" | value === undefined) {
                    return Promise.reject("Hata");
                }
                return value;
            })
            .catch(function (err) {
                return err;
            });
    }
};


/*currencies.eur().then((value) => {
    console.log(value);
});*/

module.exports = {currencies};