require('./connectorSetup.js')();

var UserWelcomedKey = 'UserWelcomed';
var showAvatar = 'showAvatar';
var AvatarReminder = 'AvatarReminder';
var AvatarApertura = 'AvatarApertura';
var AvatarPresentation = 'AvatarPresentation';
var JsonPath = require('jsonpath');
var faqs = require('./faqs.json');

var intents = JsonPath.query(faqs, '$.faqs.responses[?(@.intent != "")].intent');

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bb31143e-7f94-4838-aeb3-02b399603fbf?subscription-key=eb17b4ee1a45442c909a3779fcfd00c1');
bot.recognizer(recognizer);

//TODOS - timer must be a user variable;
var timer;

//Bot listening for inbound backchannel events
bot.on("event", function (event) {
    var msg = new builder.Message().address(event.address);
    msg.textLocale("it-IT");
    if (event.name === showAvatar) {
        if (event.value === AvatarApertura) {
            msg.text("Ciao, sono il nuovo Assistente Virtuale dell'Arma dei Carabinieri");
        }
    }
    bot.send(msg);
});

bot.dialog('apertura', function (session) {
    if (!session.privateConversationData[UserWelcomedKey]) {
        session.privateConversationData[UserWelcomedKey] = true;
        session.send('Ciao, come posso aiutarti?');
    } else {
        session.send('Ben tornato, come posso aiutarti adesso?');
    }

    timer = setTimeout(function(){
        session.send('La chat è ancora attiva. Fammi una domanda.');
        var reply = createEvent(showAvatar, AvatarReminder, session.message.address);
        session.endDialog(reply);
    },20000);

}).triggerAction({
    matches: 'apertura'
});

bot.dialog('chiusura', function (session) {
    clearTimeout(timer);
    session.endConversation('Grazie per averci contattato.');
    session.privateConversationData[UserWelcomedKey] = false;
}).triggerAction({
    matches: 'chiusura'
});

bot.dialog('faqs', function (session, args, next) {
    clearTimeout(timer);
    session.endDialog(retrieveResponse(args.intent.intent));
    //args.intent.score - it contains the score value
}).triggerAction({
    matches: intents
});

bot.dialog('presentazione', function (session) {
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
    session.endDialog('Spero di essere alla sua altezza');
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