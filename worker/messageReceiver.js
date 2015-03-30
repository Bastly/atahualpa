module.exports = function(opts){
    
    if(!opts || !opts.busData){
         throw new Error('bus data is needed');
    }
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var messageReceiverRep = zmq.socket('rep'); // Receives messages from clients, replyies ACK and forwards the message
    var logHandler = require('../logHandler');
    var log = logHandler({name:'busData', log:opts.log});    
    
    messageReceiverRep.bind('tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);
    
    messageReceiverRep.on('message', function(action, data){
        log.info('message got');
        //TODO we must check api keys eventually
        if(action == "send"){
            messageReceiverRep.send(['200', '{"message": "ACK"}']);
            log.info('message ACK');
            log.info('forwarding message');
            opts.busData.send(data);
        }else{
            messageReceiverRep.send(['400', '{"message": "we only accept send actions here!"}']);
            log.info('message noy valid received');
        }
    });
    
    var module = {};
    return module;
};
