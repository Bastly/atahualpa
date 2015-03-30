var fs = require('fs');
var assert = require('assert');
var config = require('./config.json');
var zmq = require('zmq');
var constants = require('bastly_constants');

if(!config.chaskiZeromq.ip || !config.chaskiSocketio.ip) {
    console.log('Must give chaski info');
    process.exit(9);
}

describe('Request a chaski zeromq worker', function() {

    it('message response IP should be equal to CHASKI given IP', function (done) {

        var client = zmq.socket('req');

        client.connect('tcp://'+ config.client.ip + ':' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER);

        var busOps = require('../worker/busOps')
        ({
            "verbose" : constants.LOG_LEVEL_ERROR
        });
        var chaskiAssigner = require('../worker/chaskiAssigner')
        ({
            "chaskiZeromq": config.chaskiZeromq,
            "chaskiSocketio": config.chaskiSocketio,
            "busOps": busOps,
            "verbose" : constants.LOG_LEVEL_ERROR
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
            console.log('got message');
            console.log(data.toString());
            console.log(result.toString());
            var parsedResponse = JSON.parse(data.toString());
            assert.equal(result.toString(), '200');
            assert.equal(parsedResponse.ip, config.chaskiZeromq.ip);

            client.close();
            busOps.close();
            chaskiAssigner.close();
            done();
        });
    });
});

