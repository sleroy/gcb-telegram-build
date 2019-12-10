const {
  Telegram
} = require('telegraf')
const humanizeDuration = require('humanize-duration');


console.log("Initialization of the cloud Function");
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN;
const GROUP_ID = process.env.GROUP_ID;

//const tg = new Telegram(process.env.BOT_TOKEN)
const tg = new Telegram(token)

// subscribeSlack is the main function called by Cloud Functions.
module.exports.subscribeTelegram = (pubSubEvent, context) => {

  const build = eventToBuild(pubSubEvent.data);

  // Send message to Slack.
  const message = createTelegramMessage(build);
  const duration = humanizeDuration(new Date(build.finishTime) - new Date(build.startTime));
  const msgText = `<br><br>Build ${build.id} finished with status ${build.status}, in ${duration}.`;
  let msgHtml = `${msgText}<br><a href="${build.logUrl}">Build logs</a>`;
  if (build.images) {
    const images = build.images.join(',');
    msgHtml += `Images: ${images}`;
  }

  tg.sendMessage(GROUP_ID, message + msgHtml, { parse_mode: "HTML" })
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function randomize(arr) {
  return arr[getRandomInt(arr.length)];
}

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
}

// createTelegramMessage creates a message from a build object.
const createTelegramMessage = (build) => {


  switch (build.status) {
    case 'SUCCESS':
      return randomize([
        "Yahoo, the build is successful",
        "Great, the build is successful"
      ]);
    case 'FAILURE':
      return randomize(
        [
          "Build failure",
        ]
      );
    case 'INTERNAL_ERROR':
      return "Internal error. The build has failed."
        ;
    case 'QUEUED':
      return "The build has been enqueued."
        ;
    case 'WORKING':
      return "The build is in progress."
        ;
    case 'TIMEOUT':
      return "The build took too long, the build has failed."
        ;
    case 'CANCELLED':
      return "T The build has been cancelled."
        ;
  }
  return "Something is strange, baby";
}
