module.exports = function(opts){
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var module = {};
    var defaultParams = {};
    var logHandler = require('../logHandler');
    var log = logHandler({name:'chaskiNotifier', log:opts.log});    
    
    // CHECK
    if(!opts || !opts.ipChaski){
        log.error('given opts insuficient:' + opts);
        throw new Error('chaski IP or RANGE IPS required');
    }
    
    //initialize
    var ipChaski = opts.ipChaski;
    var chaskiChannelNotifierReq = zmq.socket('req');

    module.close = function closeChaskiNotifier () {
        chaskiChannelNotifierReq.close();
    };

    module.notifyChaski = function notifyChaski (id, ip) {
        log.info('connecting to ip: ', ip, 'will try:','tcp://' + ipChaski + ':' + constants.PORT_CHASKI_CHANNEL_NOTIFIER);
        chaskiChannelNotifierReq.connect('tcp://' + ipChaski + ':' + constants.PORT_CHASKI_CHANNEL_NOTIFIER);
        var message = {id : id};
        if (ip) {
            chaskiChannelNotifierReq.send(JSON.stringify(message));
            log.info('sending to given IP');
        } else {
            chaskiChannelNotifierReq.send(JSON.stringify(message));
            log.info('sending to default IP');
        }
    };

    return module;
};

