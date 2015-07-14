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
    var program = require('commander');

    program
      .version('0.0.1')
      .usage('atahualpa --db <IP> --curaca <IP> --consul <IP>')
      .option('-d, --db <IP>', 'specify db IP ', '127.0.0.1')
      .option('-u, --curaca <IP>', 'specify curaca IP ', '127.0.0.1')
      .option('-c, --consul <IP>', 'specify the consul ip', '127.0.0.1')
      .parse(process.argv);

    console.log('Running with db ', program.db);
    console.log('Running with curaca on: ', program.curaca);
    console.log('Running with consul ip on: ', program.consul);

    var busOps = require('./worker/busOps')
    ({
        "log": log
    });

    var chaskiAssigner = require('./worker/chaskiAssigner')
    ({
        "IP_CONSUL": program.consul,
        "curaca" : program.curaca,
        "busOps": busOps,
        "db": program.db,
        "log": log
    });

    var busData = require('./worker/busData')
    ({
        "log": log
    });

    var messageReceiver = require('./worker/messageReceiver')
    ({
        "busData": busData,
        "curaca" : program.curaca,
        "db": program.db,
        "log": log
    });

});
