module.exports = function(opts){
    
    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var module = {};
    var defaultParams = {};
    var logHandler = require('../logHandler');
    
    // CHECK
    if(!opts){
        log.error('given opts insuficient:' + opts);
        throw new Error('chaski IP or RANGE IPS required');
    }
    
    var log = logHandler({name:'busOps', log:opts.log});    
    
    //initialize
    var busOps = zmq.socket('pub');
    var busOpsUrl = 'tcp://*:' + constants.PORT_PUB_SUB_ATAHUALPA_CHASKI_OPS;
    log.info('binding busOps on', busOpsUrl);
    busOps.bind(busOpsUrl);

    module.close = function closeBusOps () {
        busOps.close();
    };

    module.notifyChaski = function notifyChaski (chaskiId,to ) {
        log.info('notifiying chaski', chaskiId.toString(), 'of listen channel', to.toString() );
        busOps.send([chaskiId, to]);
    };

    return module;
};

