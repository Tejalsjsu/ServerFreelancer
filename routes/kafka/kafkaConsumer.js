var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.Client("localhost:2181/"),
    consumer = new Consumer(
        client,
        [
            { topic: 'TutorialTopic', partition: 0, offset: 0 }
        ],
        { fromOffset: true }
    );

consumer.on('message', function (message)
{
    console.log(message);
});

consumer.on('error', function (err)
{
    console.log('ERROR: ' + err.toString());
});