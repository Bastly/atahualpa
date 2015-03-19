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
    var chaskiChannelNotifierZero = zmq.socket('req');
    var chaskiChannelNotifierSocketio = zmq.socket('req');
    log.info('connecting to ip: ', ipChaski, 'will try:','tcp://' + ipChaski + ':' + constants.PORT_REQ_REP_ATAHUALPA_CHASKI_CHANNEL_ASSIGN_ZEROMQ);
    chaskiChannelNotifierZero.connect('tcp://' + ipChaski + ':' + constants.PORT_REQ_REP_ATAHUALPA_CHASKI_CHANNEL_ASSIGN_ZEROMQ);
    chaskiChannelNotifierSocketio.connect('tcp://' + ipChaski + ':' + constants.PORT_REQ_REP_ATAHUALPA_CHASKI_CHANNEL_ASSIGN_ZEROMQ_SOCKET_IO);

    module.close = function closeChaskiNotifier () {
        chaskiChannelNotifierZero.close();
        chaskiChannelNotifierSocketio.close();
    };

    module.notifyChaski = function notifyChaski (id, ip) {
        var message = {id : id};
            chaskiChannelNotifierSocketio.send(JSON.stringify(message));
            chaskiChannelNotifierZero.send(JSON.stringify(message));
    };

    return module;
};

