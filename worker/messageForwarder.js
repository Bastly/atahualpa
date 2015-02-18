module.exports = function(){
    
    var zmq = require('zmq');
    var constants = require('constants');
    var messageForwarderPub = zmq.socket('pub'); // publishing channel to forward messages that should be handled by workers.
    
    messageForwarderPub.bind('tcp://*:' + constants.PORT_CHASKIES);
    var module = {};
    
    module.send = function send(params){
        messageForwarderPub.send(params);
    }
    
    return module;
}
