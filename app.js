// DEPENDENCIES
var domain = require('domain').create();

var bunyan = require('bunyan');
var log = bunyan.createLogger
({
    name: "atahualpa",
    streams: [
        {
            path: '/var/log/atahualpa.log'
        }
    ]
});

//giving bunyan a chance to flush
domain.on('error', function(err){
    // log the exception
    log.fatal(err);

    if (typeof(log.streams[0]) !== 'object') return;

    // throw the original exception once stream is closed
    log.streams[0].stream.on('close', function(streamErr, stream) {
        process.exit(1);
    });

    // close stream, flush buffer to disk
    log.streams[0].stream.end();
});

domain.run(function(){

    var constants = require('bastly_constants');

    if (!process.argv[2]) {
        log.fatal('Must give chaski info');
        throw new Error('insuficientarametersgiven');
    }

    var IP_CHASKI = process.argv[2];

    var chaskiNotifier = require('./worker/chaskiNotifier')
    ({
        "ipChaski": IP_CHASKI,
        "log": log
    });

    var chaskiAssigner = require('./worker/chaskiAssigner')
    ({
        "ipChaski": IP_CHASKI,
        "chaskiNotifier": chaskiNotifier,
        "log": log
    });

    var messageForwarder = require('./worker/messageForwarder')
    ({
        "log": log
    });

    var messageReceiver = require('./worker/messageReceiver')
    ({
        "messageForwarder": messageForwarder,
        "log": log
    });

});
