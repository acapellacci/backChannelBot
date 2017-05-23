require('./connectorSetup.js')();

//Bot listening for inbound backchannel events - in this case it only listens for events named "buttonClicked"
bot.on("event", function (event) {
    var msg = new builder.Message().address(event.address);
    msg.textLocale("en-us");
    if (event.name === "buttonClicked") {
        msg.text("I see that you just pushed that button");
    }
    bot.send(msg);
})

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bb31143e-7f94-4838-aeb3-02b399603fbf');
bot.recognizer(recognizer);

bot.dialog('saluto', function (session) {
    session.endDialog('Ciao, sono il tuo assistente personale.');
}).triggerAction({
    matches: 'saluto'
});

//Basic root dialog which takes an inputted color and sends a changeBackground event. No NLP, regex, validation here - just grabs input and sends it back as an event. 
bot.dialog('/', [
    function (session) {
        var reply = createEvent("changeBackground", session.message.text, session.message.address);
        session.endDialog(reply);
    }
]);

//Creates a backchannel event
const createEvent = (eventName, value, address) => {
    var msg = new builder.Message().address(address);
    msg.data.type = "event";
    msg.data.name = eventName;
    msg.data.value = value;
    return msg;
}



