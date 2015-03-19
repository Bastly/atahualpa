module.exports = function(opts){
    
    if(!opts || !opts.messageForwarder){
         throw new Error('message forwarder is needed');
    }
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var messageReceiverRep = zmq.socket('rep'); // Receives messages from clients, replyies ACK and forwards the message
    var logHandler = require('../logHandler');
    var log = logHandler({name:'messageReceiver', log:opts.log});    
    
    messageReceiverRep.bind('tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_MESSAGES);
    
    messageReceiverRep.on('message', function(channelId, message){
        log.info('message got:' + message.toString );
        messageReceiverRep.send(['200', '{"message": "ACK"}']);
        log.info('message ACK');
        
        log.info('forwarding message');
        opts.messageForwarder.send([channelId, message]);
    });
    
    var module = {};
    return module;
};
