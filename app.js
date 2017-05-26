require('./connectorSetup.js')();

var UserWelcomedKey = 'UserWelcomed';
var JsonPath = require('jsonpath');
var faqs = require('./faqs.json');

var request = require('request'),
    xmlbuilder = require('xmlbuilder'),
    wav = require('wav'),
    Speaker = require('speaker');

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
    synthesize('Mi presento');
    session.send('Sono il nuovo Assistente Virtuale dell\'Arma dei Carabinieri.');
    synthesize('Sono il nuovo Assistente Virtuale dell\'Arma dei Carabinieri.');
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
    setTimeout(function() {
        session.send('Ora ti mostro qualche novità');
        setTimeout(function() {
            session.send('Per ogni argomento trattato la mia veste grafica cambierà mostrandoti immagini e video attinenti il tema trattato. Per esempio quando parleremo di Corazzieri lo schermo si colorerà di rosso.');
            var reply = createEvent("changeBackground", 'red', session.message.address);
            session.send(reply);
            setTimeout(function() {
                var reply = createEvent("changeBackground", 'white', session.message.address);
                session.send(reply);
                session.endDialog('Ora non mi rimane che rispondere alle tue domande.');
            }, 5000);
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

function synthesize(text){

    // Note: The way to get api key:
    // Free: https://www.microsoft.com/cognitive-services/en-us/subscriptions?productId=/products/Bing.Speech.Preview
    // Paid: https://portal.azure.com/#create/Microsoft.CognitiveServices/apitype/Bing.Speech/pricingtier/S0
    var apiKey = "10136f74ca1740519c0409ea0c8107fd";
    var ssml_doc = xmlbuilder.create('speak')
        .att('version', '1.0')
        .att('xml:lang', 'it-IT')
        .ele('voice')
        .att('xml:lang', 'it-IT')
        .att('xml:gender', 'Female')
        .att('name', 'Microsoft Server Speech Text to Speech Voice (it-IT)')
        .txt(text)
        .end();
    var post_speak_data = ssml_doc.toString();

    request.post({
    	url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
        headers: {
            'Ocp-Apim-Subscription-Key' : apiKey
        }
    }, function (err, resp, access_token) {
        if (err || resp.statusCode != 200) {
            console.log(err, resp.body);
        } else {
            try {
                request.post({
                    url: 'https://speech.platform.bing.com/synthesize',
                    body: post_speak_data,
                    headers: {
                        'content-type' : 'application/ssml+xml',
                        'X-Microsoft-OutputFormat' : 'riff-16khz-16bit-mono-pcm',
                        'Authorization': 'Bearer ' + access_token,
                        'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
                        'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960',
                        'User-Agent': 'TTSNodeJS'
                    },
                    encoding: null
                }, function (err, resp, speak_data) {
                    if (err || resp.statusCode != 200) {
                        console.log(err, resp.body);
                    } else {
                        try {
                            var reader = new wav.Reader();
                            reader.on('format', function (format) {
                                reader.pipe(new Speaker(format));
                            });
                            var Readable = require('stream').Readable;
                            var s = new Readable;
                            s.push(speak_data);
                            s.push(null);
                            s.pipe(reader);
                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                });
            } catch (e) {
                console.log(e.message);
            }
        }
    });
}



