require('./connectorSetup.js')();

var JsonPath = require('jsonpath');
var faqs = require('./faqs.json');
//Bot listening for inbound backchannel events - in this case it only listens for events named "buttonClicked"
bot.on("event", function (event) {
    var msg = new builder.Message().address(event.address);
    msg.textLocale("en-us");
    if (event.name === "buttonClicked") {
        msg.text("I see that you just pushed that button");
    }
    bot.send(msg);
})

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bb31143e-7f94-4838-aeb3-02b399603fbf?subscription-key=eb17b4ee1a45442c909a3779fcfd00c1');
bot.recognizer(recognizer);

bot.dialog('saluto', function (session) {
    var reply = createEvent("changeBackground", 'white', session.message.address);
    session.send(reply);
    session.send('Ciao, sono il tuo assistente personale.');
}).triggerAction({
    matches: 'saluto'
});

bot.dialog('atletica', function (session) {
    var reply = createEvent("changeBackground", 'blue', session.message.address);
    session.send(reply);
    session.send(retrieveResponse('atletica'));
}).triggerAction({
    matches: 'atletica'
});

bot.dialog('corazzieri', function (session) {
    var reply = createEvent("changeBackground", 'red', session.message.address);
    session.send(reply);
    session.send(retrieveResponse('corazzieri'));
}).triggerAction({
    matches: 'corazzieri'
});

bot.onDefault(
   function (session, args, next) {
        var reply = createEvent("changeBackground", 'white', session.message.address);
    session.send(reply);
    session.send('Non ho capito');
   }
);

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
    var response = JsonPath.query(faqs, '$.faqs.responses[?(@.intent === "' + intent + '")].response')[0];
    if (response) {
        output = response[0];
    } else {
        output = 'Spiegati meglio';
    }
    return response;
}



