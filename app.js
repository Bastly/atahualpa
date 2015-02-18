if(!process.argv[2]){
    log.info('Must give chaski info');
    process.exit(9);
}

var IP_CHASKI = process.argv[2];

// DEPENDENCIES
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "atahualpa"});


var chaskiNotifier = require('./worker/chaskiNotifier')({"ipChaski": IP_CHASKI});
var chaskiAssigner = require('./worker/chaskiAssigner')({"ipChaski": IP_CHASKI, "chaskiNotifier": chaskiNotifier});
var messageForwarder = require('./worker/messageForwarder')();
var messageReceiver = require('./worker/messageReceiver')({"messageForwarder": messageForwarder});
