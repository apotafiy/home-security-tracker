const http = require("http");
const dateAPI = require("date-and-time");
// heroku time is 7 hours ahead. probably 'utc'
function httpCall() {
  const options = {
    host: "home-security-tracker.herokuapp.com",
    port: 80,
    //host: "localhost",
    //port: 5000,
    path: "/",
  };
  http
    .get(options, (res) => {
      res.on("data", (chunk) => {
        try {
          console.log("HEROKU RESPONSE: ", chunk);
        } catch (err) {
          console.error(err.message, err.stacktrace);
        }
      });
    })
    .on("error", (err) => {
      console.error(err.message, err.stacktrace);
    });
}
function startKeepAlive() {
  httpCall();
  const intervalID = setInterval(() => {
    const hour = dateAPI.addHours(new Date(), -7).getHours();
    console.log("Keep-alive Hour: ", hour);
    if (hour >= 0 && hour <= 6) {
      //hour >= 7 && hour <= 13 in UTC
      //12am - 6am
      clearInterval(intervalID);
      console.log("INTERVAL CLEARED");
      return;
    }
    httpCall();
  }, 30 * 60 * 1000);
}
module.exports = startKeepAlive;
