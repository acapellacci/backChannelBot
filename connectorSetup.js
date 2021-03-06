module.exports = function() {

    var restify = require('restify');
    global.builder = require('botbuilder');

    var connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID ? process.env.MICROSOFT_APP_ID : '863a1c9b-9897-403f-a8aa-e3fd8329b87d',
            appPassword: process.env.MICROSOFT_APP_PASSWORD ? process.env.MICROSOFT_APP_PASSWORD : 'pggMyZwYqYgewJbOTkEWHvW',
           gzipData: true
        });

    global.bot = new builder.UniversalBot(connector, function (session) {
        session.send('Non ho capito.');
    });
    // Setup Restify Server
    var server = restify.createServer();
    server.listen(process.env.port || 3978, function () {
        console.log('%s listening to %s', server.name, server.url);
    });
    server.post('/api/messages', connector.listen());
    bot.use(builder.Middleware.dialogVersion({ version: 0.2, resetCommand: /^reset/i }));
    bot.set('persistConversationData', true);
}