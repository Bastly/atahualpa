module.exports = function(opts){
    
    if(!opts || !opts.busData){
         throw new Error('bus data is needed');
    }
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var messageReceiverRep = zmq.socket('rep'); 
    var logHandler = require('../logHandler');
    var log = logHandler({name:'busData', log:opts.log});    
    
    messageReceiverRep.bind('tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);

    // Receives messages from clients, replyies ACK and forwards the message
    messageReceiverRep.on('message', function(action, to, from, apikey, data){
        log.info('message got', action.toString(), from.toString(), apikey.toString(), data.toString());
        //TODO we must check api keys eventually
        if(action == "send"){
            messageReceiverRep.send(['200', '{"message": "ACK"}']);
            log.info('message ACK');
            log.info('forwarding message', to, from, apikey);
            opts.busData.send([to, from, apikey, data]);
        }else{
            messageReceiverRep.send(['400', '{"message": "we only accept send actions here!"}']);
            log.info('message not valid received');
        }
    });
    
    var module = {};
    return module;
};
