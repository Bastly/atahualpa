module.exports = function(opts){
    
    var zmq = require('zmq');
    var constants = require('./../constants');
    var module = {};
    var defaultParams = {};
    var bunyan = require('bunyan');
    var log = bunyan.createLogger({name: "atahualpa:chaskiAssigner"});
    log.level(opts.verbose || 20);
    
    // CHECK
    if(!opts || !opts.ipChaski){
        throw new Error('chaski IP or RANGE IPS required');
    }
    
    // initialize
    var ipChaski = opts.ipChaski;
    var chaskiChannelNotifierReq = zmq.socket('req');

    module.notifyChaski = function notifyChaski (id, ip) {
        log.info('connecting to ip: ', ip, 'will try:','tcp://' + ipChaski + ':' + constants.PORT_CHASKI_CHANNEL_NOTIFIER);
        chaskiChannelNotifierReq.connect('tcp://' + ipChaski + ':' + constants.PORT_CHASKI_CHANNEL_NOTIFIER);
        var message = {ip : ip};
        if (ip) {
            // when given ip should select or something
        } else {
            chaskiChannelNotifierReq.send(JSON.stringify(message));
        }
    };

    return module;
}

