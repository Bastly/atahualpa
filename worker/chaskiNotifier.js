module.exports = function(opts){
    
    var zmq = require('zmq');
    var constants = require('./../constants');
    var module = {};
    var defaultParams = {};

    console.log('initializing chaskiNotifier');
    
    // CHECK
    if(!opts || !opts.ipChaski){
        throw new Error('chaski IP or RANGE IPS required');
    }
    
    // initialize
    var ipChaski = opts.ipChaski;
    var chaskiChannelNotifierReq = zmq.socket('req');

    module.notifyChaski = function notifyChaski (id, ip) {
        chaskiChannelNotifierReq.connect('tcp://' + ipChaski + ':' + constants.PORT_CHASKIES_NOTIFIER);
        var message = {ip : ip};
        if (ip) {
            // when given ip should select or something
        } else {
            chaskiChannelNotifierReq.send(JSON.stringify(message));
        }
    };

    return module;
}

