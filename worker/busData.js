module.exports = function(opts){
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var busData = zmq.socket('pub'); // publishing channel to forward messages that should be handled by workers.
    var logHandler = require('../logHandler');
    var log = logHandler({name:'busData', log:opts.log});    
    
    busData.bind('tcp://*:' + constants.PORT_PUB_SUB_ATAHUALPA_CHASKI_MESSAGES);
    var module = {};
    
    module.send = function send(params){
        
        log.info('sending message to chaskies message');
        busData.send(params);
    };
    
    return module;
};
