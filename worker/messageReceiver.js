module.exports = function(opts){
    
    if(!opts || !opts.busData){
         throw new Error('bus data is needed');
    }
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var messageReceiverRep = zmq.socket('rep');
    var curacaCom = zmq.socket('req');
    curacaCom.connect('tcp://' + opts.curaca + ':' + constants.PORT_REQ_REP_ATAHUALPA_CURACA_COMM);
    var logHandler = require('../logHandler');
    var log = logHandler({name:'busData', log:opts.log});    
    var redis = require("redis");
    var client = redis.createClient(6379, opts.redis);
    
    messageReceiverRep.bind('tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);

    // Receives messages from clients, replyies ACK and forwards the message
    messageReceiverRep.on('message', function(action, to, from, apikey, data){
        log.info('message got', action.toString(), from.toString(), apikey.toString(), data.toString());
        var fromAppend = apiKey + ':' + from;
        var toAppend = apiKey + ':' + to;
        //TODO we must check api keys eventually
        if(action == "send"){

            client.get(['apikey:'+ apiKey], function (err, reply) { //check if key exists
                if (reply){
                    var keyparams = JSON.parse(reply);
                    client.get('APIKEY:COUNTER:'+ apiKey, function (err, reply) {
                        if (reply < keyparams.limit) { // still enough request
                            curacaCom.send([constants.CURACA_TYPE_MESAGE, toAppend, fromAppend, apikey]);
                            messageReceiverRep.send(['200', '{"message": "ACK"}']);
                            log.info('forwarding message', toAppend, fromAppend, apikey);
                            opts.busData.send([toAppend, fromAppend, apikey, data]);
                        } else {
                             chaskiAssigner.send(['404', JSON.stringify({"message":"key limit reached, go to your profile to upgrade."})]);
                        }
                    });
                } else {
                    chaskiAssigner.send(['404', JSON.stringify({"message":"invalid api key, please check your API KEY value."})]);
                }
            });
        }else{
            messageReceiverRep.send(['400', '{"message": "we only accept send actions here!"}']);
            log.info('message not valid received');
        }
    });
    
    var module = {};
    return module;
};
