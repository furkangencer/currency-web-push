const {currencies} = require("./fetch-currency.js");

currencies.eur().then((value) => {
    console.log(value);
});