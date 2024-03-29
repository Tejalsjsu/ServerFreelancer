let kafka = require('kafka-node');
let kafka_topic = require('../../configs/kafka_topic').kafka_topic_enums;

function ConnectionProvide(){
    this.getConsumer = function(topic_name){
        if (!this.kafkaConsumerConnection){
            this.client = new kafka.Client("localhost:2181");
            this.kafkaConsumerConnection = new kafka.Consumer(this.client,
                { topic: kafka_topic.RESPONSE, partition: 0 }
            );
            this.client.on('ready', function() {
                console.log('Client is ready')
            })
            this.client.on('message', function (message) {
                console.log('msg received');
            })
            }
    return this.kafkaConsumerConnection;
    };

    //Code will be executed when we start producer
    this.getProducer = function(){
        if(!this.kafkaProducerConnection){
            this.client = new kafka.Client("localhost:2181");
            var HighLevelProducer = kafka.HighLevelProducer;
            this.kafkaProducerConnection = new HighLevelProducer(this.client);
            console.log("Producer is ready");
        }
        return this.kafkaProducerConnection;
    };
}
exports = module.exports = new ConnectionProvide;