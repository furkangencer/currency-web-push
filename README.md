# currency-web-push
In this project, it is intended to get real-time currency data (in this case EURTRY parity) and send it as a push notification through the user's web browser.

Simply visiting `/publish` route will get the data and send it to the queue. Then consumer which also runs upon server start will receive this message and send it as a push notification.

## Notes: 
Since free apis found on the google offer limited service and are updated hourly, I've decided to make a request to investing.com's website which is updated momentarily, and extract the spesific span element that holds the currency data from the body. (cheerio is very handy for this)

## Important Note:
If you want to host the application and make it listen on the port specified, you might want to check the articles below out since you'll have to make some configurations in your server. 

[For Nginx (Step-4)](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04 )


[For Apache](https://blog.cloudboost.io/get-apache-and-node-working-together-on-the-same-domain-with-javascript-ajax-requests-39db51959b79)

## TODOs:
Serviceworker will be used. 

MongoDB will be used to store users' subscription details for push notifications.
