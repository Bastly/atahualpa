// DEPENDENCIES
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "atahualpa"});
var constants = require('constants');

if(!process.argv[2]){
    log.info('Must give chaski info');
    process.exit(9);
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
    "chaskiNotifier": chaskiNotifier});

var messageForwarder = require('./worker/messageForwarder')
();

var messageReceiver = require('./worker/messageReceiver')
({
    "messageForwarder": messageForwarder
});
