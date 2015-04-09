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
        log.fatal('Must give consul ip');
        throw new Error('insuficientarametersgiven');
    }
    var IP_CONSUL = process.argv[2];


    var busOps = require('./worker/busOps')
    ({
        "log": log
    });

    var chaskiAssigner = require('./worker/chaskiAssigner')
    ({
        "IP_CONSUL": IP_CONSUL,
        "busOps": busOps,
        "log": log
    });

    var busData = require('./worker/busData')
    ({
        "log": log
    });

    var messageReceiver = require('./worker/messageReceiver')
    ({
        "busData": busData,
        "log": log
    });

});
