require('./connectorSetup.js')();

var UserWelcomedKey = 'UserWelcomed';
var JsonPath = require('jsonpath');
var faqs = require('./faqs.json');

//Bot listening for inbound backchannel events - in this case it only listens for events named "buttonClicked"
bot.on("event", function (event) {
    var msg = new builder.Message().address(event.address);
    msg.textLocale("it-IT");
    if (event.name === "buttonClicked") {
        msg.text("Hai cliccato sul bottone");
    }
    bot.send(msg);
})

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bb31143e-7f94-4838-aeb3-02b399603fbf?subscription-key=eb17b4ee1a45442c909a3779fcfd00c1');
bot.recognizer(recognizer);

bot.dialog('apertura', function (session) {
    var reply = createEvent("changeBackground", 'white', session.message.address);
    session.send(reply);
    
    if (!session.privateConversationData[UserWelcomedKey]) {
        session.privateConversationData[UserWelcomedKey] = true;
        return session.endDialog('Ciao, come posso aiutarti?');
    } else {
        session.endDialog('Ben tornato, come posso aiutarti adesso?');
    }

}).triggerAction({
    matches: 'apertura'
});

bot.dialog('chiusura', function (session) {
    var reply = createEvent("changeBackground", 'white', session.message.address);
    session.send(reply);
    session.endConversation('Grazie per averci contattato.');
    session.privateConversationData[UserWelcomedKey] = false;
}).triggerAction({
    matches: 'chiusura'
});

bot.dialog('atletica', function (session) {
    var reply = createEvent("changeBackground", 'blue', session.message.address);
    session.send(reply);
    session.endDialog(retrieveResponse('atletica'));
}).triggerAction({
    matches: 'atletica'
});

bot.dialog('corazzieri', function (session) {
    var reply = createEvent("changeBackground", 'red', session.message.address);
    session.send(reply);
    session.endDialog(retrieveResponse('corazzieri'));
}).triggerAction({
    matches: 'corazzieri'
});

bot.dialog('presentazione', function (session) {
    session.send('Mi presento');
    session.send('Sono il nuovo Assistente Virtuale dell\'Arma dei Carabinieri.');
    session.send('Sostituisco la collega','Sostituisco la collega');
    session.send({
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: "http://localhost:8000/media/virtual_assistant_carabinieri.jpg",
                    name: "virtual_assistant_carabinieri.jpg"
                }
            ]
        });
    session.send('Spero di essere alla sua altezza');
    setTimeout(function () {
        session.send('Ora ti mostro qualche novità');
        setTimeout(function () {
            session.send({
                attachments: [
                    {
                        contentType: "video/mp4",
                        contentUrl: "http://localhost:8000/media/editChatBox_001.mp4",
                        name: "editChatBox_001.mp4"
                    }
                ]
            });
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

function waitingFor(delay) {
    var wait = true;

    var currentDate = new Date();
    var currentTime = currentDate.getTime();

    while (wait) {
        var nowDate = new Date();
        var nowTime = nowDate.getTime();
        if (((nowTime - currentTime) > delay) || ((nowTime - currentTime) > 20 * 1000)) {
            break;
        }
    }

}