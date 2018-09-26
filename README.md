# currency-web-push
In this project, it is intended to get realtime currency rate and send it as a push notification through the user's web browser.

Simply visiting `/publish` route will get the data and send it to the queue. Then consumer which also runs upon server start will receive this message and send it as a push notification.

#### Why I didn't use an API to get currency rates: 
Since **free** APIs found on the google offer limited service and are updated hourly, I've decided to make a request to x-rates.com's website which is updated momentarily, and get the body and then extract the specific span element that holds the currency data. (cheerio is very handy for this)

#### Important Note:
If you want to host the application and make it listen on the port specified, you might want to take a look at the articles below since you'll have to make some configurations in your server. 

[For Nginx (Step-4)](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04 )


[For Apache](https://blog.cloudboost.io/get-apache-and-node-working-together-on-the-same-domain-with-javascript-ajax-requests-39db51959b79)

## TODOs:

- MongoDB will be used to store users' subscription details for push notifications.
- Recieving currency rates via push notification every hour.