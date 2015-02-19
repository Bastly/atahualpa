var fs = require('fs');
var assert = require('assert');
var config = require('./config.json');
var zmq = require('zmq');
var constants = require('../constants');

if(!config.chaski.ip) {
    console.log('Must give chaski info');
    process.exit(9);
}

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1, 2, 3].indexOf(5));
            assert.equal(-1, [1, 2, 3].indexOf(0));
        });
    });
});

describe('Request a chaski worker', function() {
    var chaski = zmq.socket('rep');
    var client = zmq.socket('req');

    it('message response IP should be equal to CHASKI given IP', function (done) {

        var chaskiNotifier = require('../worker/chaskiNotifier')
        ({
            "ipChaski": config.chaski.ip,
            "verbose" : constants.LOG_LEVEL_ERROR
        });
        var chaskiAssigner = require('../worker/chaskiAssigner')
        ({
            "ipChaski": config.chaski.ip,
            "chaskiNotifier": chaskiNotifier,
            "verbose" : constants.LOG_LEVEL_ERROR
        });

        chaski.bind('tcp://'+ config.chaski.ip + ':' + constants.PORT_CHASKI_CHANNEL_NOTIFIER);
        chaski.on('message', function(result, data) {
            var parsedResponse = JSON.parse(data);
            console.log(result, data);
        });
        
        client.connect('tcp://'+ config.client.ip + ':' + constants.PORT_CHASKI_ASSIGNER);
        var dataToSend = { id: config.client.id };
        client.send(JSON.stringify(dataToSend));

        client.on('message', function(result, data) {
            var parsedResponse = JSON.parse(data);
            assert.equal(result, 200);
            assert.equal(parsedResponse.ip, config.chaski.ip);
            done();
        });
    });

    after( function (done) {
        console.log('after test');
        chaski.close();
        done();
    });
});