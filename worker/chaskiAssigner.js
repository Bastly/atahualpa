module.exports = function(opts) {

    var zmq = require('zmq');
    var constants = require('./../constants');
    var module = {};
    var defaultParams = {};

    // CHECK
    if (!opts || !opts.chaskiNotifier || !opts.ipChaski) {
        console.log(opts);
        throw new Error('chaski notifier required');
    }

    // initialize
    var chaskiAssigner = zmq.socket('rep');
    chaskiAssigner.bind('tcp://*:' + constants.PORT_CHASKI_ASSIGNER, function (err) {
        if (err) {
            throw err;
        }
        console.log('chaski assigner bound listening on', constants.PORT_CHASKI_ASSIGNER);
    
        chaskiAssigner.on('message', function(data) {
            console.log(socket.identity + ': received ' + data.toString());
            var messagePayload = JSON.parse(data.toString());
            var response = { ip : opts.ipChaski };
            chaskiAssigner.send(['200', JSON.stringify(response)]);
            opts.chaskiNotifier.notifyChaski(messagePayload.id);
        });
    });

    return module;
};