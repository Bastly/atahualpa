// DEPENDENCIES
var bunyan = require('bunyan');
var log = bunyan.createLogger
({
    /*
    name: "atahualpa"
    */
    name: "atahualpa",
    streams: [
        {
            type: 'rotating-file',
            path: '/var/log/atahualpa.log',
            //path: '/var/log/atahualpa.log',
            //level: 'info'
        }
    ]
});

//giving bunyan a chance to flush
process.on('uncaughtException', function (err) {
    // prevent infinite recursion
    process.removeListener('uncaughtException', arguments.callee);

    // bonus: log the exception
    log.fatal(err);

    if (typeof(log.streams[0]) !== 'object') return;

    // throw the original exception once stream is closed
    log.streams[0].stream.on('close', function(streamErr, stream) {
        throw err;
    });

    // close stream, flush buffer to disk
    log.streams[0].stream.end();
});


var constants = require('constants');

if (!process.argv[2]) {
    log.info('Must give chaski info');
    throw new Error('insuficient parameters given');
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
