const request = require("request-promise"); // "request" module is defined as a peer-dependency and thus has to be installed separately.
const cheerio = require("cheerio");  // Basically jQuery for node.js

const currencies = (amount, from, to) => {
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
    return request(options)
        .then(function ($) {
            let value = $(".ccOutputRslt").text();
            if(value === "" || value === undefined) {
                return Promise.reject("Hata");
            }
            return value;
        })
        .catch(function (err) {
            return err;
        });
};

/*currencies(1, 'EUR', 'TRY').then((val) => {
    console.log(val);
});*/
module.exports = {currencies};