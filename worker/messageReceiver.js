module.exports = function(opts){
    
    if(!opts || !opts.messageForwarder){
         throw new Error('message forwarder is needed');
    }
    
    var zmq = require('zmq');
    var constants = require('./../constants');
    var messageReceiverRep = zmq.socket('rep'); // Receives messages from clients, replyies ACK and forwards the message
    
    messageReceiverRep.bind('tcp://*:' + constants.PORT_MESSAGE_RECEIVER);
    
    messageReceiverRep.on('message', function(channelId, message){
        messageReceiverRep.send(['200', '{"message": "ACK"}']);
        opts.messageForwarder.send([channelId, message]);
    });
    
    var module = {};
    return module;
}
