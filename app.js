// DEPENDENCIES
var domain = require('domain').create();

var bunyan = require('bunyan');
var log = bunyan.createLogger
({
    /*
    name: "atahualpa"
    */
    name: "atahualpa",
    streams: [
        {
            path: '/var/log/atahualpa.log'
        }
    ]
});

//giving bunyan a chance to flush
domain.on('error', function(err){
    // prevent infinite recursion
    // bonus: log the exception
    log.fatal(err);

    if (typeof(log.streams[0]) !== 'object') return;

    console.log('err');
    console.log(err);
    // throw the original exception once stream is closed
    log.streams[0].stream.on('close', function(streamErr, stream) {
        console.log('err');
        console.log(err);
        console.log(streamErr);
        process.exit(1);
    });

    // close stream, flush buffer to disk
    log.streams[0].stream.end();
});

domain.run(function(){

    var constants = require('constants');

    if (!process.argv[2]) {
        log.fatal('Must give chaski info');
        throw new Error('insuficientarametersgiven');
    }

    var IP_CHASKI = process.argv[2];

    var chaskiNotifier = require('./worker/chaskiNotifier')
    ({
        "ipChaski": IP_CHASKI,
        "verbose" : constants.LOG_LEVEL_DEBUG
    });

    var chaskiAssigner = require('./worker/chaskiAssigner')
    ({
        "ipChaski": IP_CHASKI,
        "verbose" : constants.LOG_LEVEL_DEBUG, 
        "chaskiNotifier": chaskiNotifier
    });

    var messageForwarder = require('./worker/messageForwarder')
    ();

    var messageReceiver = require('./worker/messageReceiver')
    ({
        "messageForwarder": messageForwarder
    });

});
