require('./connectorSetup.js')();

var UserWelcomedKey = 'UserWelcomed';
var DialogTimer = 'DialogTimer';
var AvatarReminder = 'AvatarReminder';
var AvatarPresentation = 'AvatarPresentation';
var JsonPath = require('jsonpath');
var faqs = require('./faqs.json');

var intents = JsonPath.query(faqs, '$.faqs.responses[?(@.intent != "")].intent');

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bb31143e-7f94-4838-aeb3-02b399603fbf?subscription-key=eb17b4ee1a45442c909a3779fcfd00c1');
bot.recognizer(recognizer);

bot.dialog('apertura', function (session) {
    if (!session.privateConversationData[UserWelcomedKey]) {
        session.privateConversationData[UserWelcomedKey] = true;
        session.send('Ciao, come posso aiutarti?');
    } else {
        session.send('Ben tornato, come posso aiutarti adesso?');
    }

    var timer = setTimeout(function(){
        var reply = createEvent("showAvatar", AvatarReminder, session.message.address);
        session.endDialog(reply);
    },10000);

    session.privateConversationData[DialogTimer] = timer;
}).triggerAction({
    matches: 'apertura'
});

bot.dialog('chiusura', function (session) {
    var timer = session.privateConversationData[DialogTimer];
    clearTimeout(timer);
    session.endConversation('Grazie per averci contattato.');
    session.privateConversationData[UserWelcomedKey] = false;
}).triggerAction({
    matches: 'chiusura'
});

bot.dialog('faqs', function (session, args, next) {
    var timer = session.privateConversationData[DialogTimer];
    session.send(timer);
    clearTimeout(timer);
    session.endDialog(retrieveResponse(args.intent.intent));
    //args.intent.score - it contains the score value
}).triggerAction({
    matches: intents
});

bot.dialog('presentazione', function (session) {
    var timer = session.privateConversationData[DialogTimer];
    clearTimeout(timer);
    session.send('Mi presento');
    session.send('Sono il nuovo Assistente Virtuale dell\'Arma dei Carabinieri.');
    session.send('Sostituisco la collega');
    session.send({
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: "http://webchatcarabinieri.azurewebsites.net/media/virtual_assistant_carabinieri.jpg",
                    name: "virtual_assistant_carabinieri.jpg"
                }
            ]
        });
    session.send('Spero di essere alla sua altezza');
    setTimeout(function () {
        session.send('Ora ti mostro qualche novità');
        setTimeout(function () {
            var reply = createEvent("showAvatar", AvatarPresentation, session.message.address);
            session.endDialog(reply);
        }, 5000);
    }, 5000);
    
}).triggerAction({
    matches: 'presentazione'
});

//Creates a backchannel event
const createEvent = (eventName, value, address) => {
    var msg = new builder.Message().address(address);
    msg.data.type = "event";
    msg.data.name = eventName;
    msg.data.value = value;
    return msg;
}

function retrieveResponse(intent) {
    var output = "";
    var response = JsonPath.query(faqs, '$.faqs.responses[?(@.intent === "' + intent + '")].response');
    if (response) {
        output = response[0];
    } else {
        output = 'Spiegati meglio';
    }
    return output;
}