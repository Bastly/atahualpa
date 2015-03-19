module.exports = function(opts) {

    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var module = {};
    var defaultParams = {};
    var logHandler = require('../logHandler');
    var log = logHandler({name:'chaskiAssigner', log:opts.log});    

    // CHECK
    if (!opts || !opts.chaskiNotifier || !opts.ipChaski) {
        log.error('given opts insuficient:' + opts);
        throw new Error('chaski notifier required');
    }

    var chaskiAssigner = zmq.socket('rep');

    module.close = function closeChaskiAssigner () {
        chaskiAssigner.close();
    };

    chaskiAssigner.bind('tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER, function (err) {
        if (err) {
            throw err;
        }

        log.info('chaski assigner bound listening on', constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER);
    
        chaskiAssigner.on('message', function(data) {
            log.info(chaskiAssigner.identity + ': received ' + data.toString());
            var messagePayload = JSON.parse(data.toString());
            var response = { ip : opts.ipChaski };
            chaskiAssigner.send(['200', JSON.stringify(response)]);
            opts.chaskiNotifier.notifyChaski(messagePayload.id, opts.ipChaski);
        });
    });

    return module;
};
