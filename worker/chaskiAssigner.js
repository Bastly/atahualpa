module.exports = function(opts) {

    var zmq = require('zmq');
    var constants = require('../constants');
    var module = {};
    var defaultParams = {};
    var bunyan = require('bunyan');
    var log = bunyan.createLogger({name: "atahualpa:chaskiAssigner"});
    log.level(opts.verbose || 20);

    // CHECK
    if (!opts || !opts.chaskiNotifier || !opts.ipChaski) {
        log.error('given opts insuficient:' + opts);
        throw new Error('chaski notifier required');
    }

    // initialize
    var chaskiAssigner = zmq.socket('rep');

    chaskiAssigner.bind('tcp://*:' + constants.PORT_CHASKI_ASSIGNER, function (err) {
        if (err) {
            throw err;
        }

        log.info('chaski assigner bound listening on', constants.PORT_CHASKI_ASSIGNER);
    
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