var fs = require('fs');
var assert = require('assert');
var config = require('./config.json');
var zmq = require('zmq');
var constants = require('bastly_constants');
var bunyan = require('bunyan');
var log = bunyan.createLogger
({
    name: "atahualpa",
    streams: [
        {
            path: '/var/log/atahualpa-test.log'
        }
    ]
});

var ipPattern = new RegExp("(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)");


describe('Request a chaski zeromq worker', function() {

    it('message response IP should be a IP', function (done) {

        var client = zmq.socket('req');

        client.connect('tcp://'+ config.client.ip + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER);

        var busOps = require('../worker/busOps')
        ({
            "verbose" : constants.LOG_LEVEL_ERROR,
            log:log
        });
        var chaskiAssigner = require('../worker/chaskiAssigner')
        ({
            "busOps": busOps,
            "verbose" : constants.LOG_LEVEL_ERROR,
            log:log
        });

        
        var dataToSendForRequestingWoker = [
            'subscribe', //ACTION
            config.client.id, //TO
            config.client.id, //FROM
            config.client.apiKey, //apiKey
            constants.CHASKI_TYPE_ZEROMQ,//type
            
        ];

        client.send(dataToSendForRequestingWoker);

        client.on('message', function (result, data) {
            var parsedResponse = JSON.parse(data.toString());
            assert.equal(result.toString(), '200');
            assert.equal(true, ipPattern.test(parsedResponse.ip));
            //TODO if no messsage is gotten, the port remain open, they should be closed
            client.close();
            busOps.close();
            chaskiAssigner.close();
            done();
        });
    });
});

