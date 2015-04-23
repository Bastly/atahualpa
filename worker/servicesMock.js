module.exports = function(opts){
    var logHandler = require('../logHandler');
    var log = logHandler({name:'servicesMock', log:opts.log});
    var constants = require('bastly_constants');
    var module = {};
    module.alive = {};

    var getServices = function getServices(forceUpdate, callback){
        checkServices(callback);
    };

    log.info('Loading mock services');
    var mockNodes = [];
    mockNodes.push({ip:'10.0.0.1', id: 'mockMock'});
    module.alive[constants.CHASKI_TYPE_ZEROMQ] = {};
    module.alive[constants.CHASKI_TYPE_ZEROMQ].nodes = mockNodes;
    module.alive[constants.CHASKI_TYPE_SOCKETIO] = {};
    module.alive[constants.CHASKI_TYPE_SOCKETIO].nodes = mockNodes;

    var checkServices = function checkServices(callback){
            if(callback){
                callback(module.alive);
            }
    };



    module.getServices  = getServices;
    return module;
};
