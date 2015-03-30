module.exports = function(opts) {

    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var module = {};
    var defaultParams = {};
    var logHandler = require('../logHandler');
    var log = logHandler({name:'chaskiAssigner', log:opts.log});    

    // CHECK
    if (!opts || !opts.busOps || !opts.chaskiSocketio || !opts.chaskiZeromq) {
        log.error('given opts insuficient:' + opts);
        throw new Error('opts insuficient');
    }

    var chaskiAssigner = zmq.socket('rep');

    module.close = function closeChaskiAssigner () {
        chaskiAssigner.close();
    };
    
    var chaskiAssignerUrl = 'tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER;
    chaskiAssigner.bind(chaskiAssignerUrl, function (err) {
        if (err) {
            throw err;
        }

        log.info('chaski assigner bound listening on', chaskiAssignerUrl);

        //    
        chaskiAssigner.on('message', function(action, to, from, apiKey, type) {
            log.info(chaskiAssigner.identity + ': received action' + action.toString());
            if(action.toString() == 'subscribe'){
                console.log('type');
                console.log(type.toString());
                if(type.toString() == constants.CHASKI_TYPE_ZEROMQ){
                    response = { ip : opts.chaskiZeromq.ip };
                    assignedChaski = opts.chaskiZeromq.id;
                }else if(type.toString() == constants.CHASKI_TYPE_SOCKETIO){
                    response = { ip : opts.chaskiSocketio.ip };
                    assignedChaski = opts.chaskiSocketio.id;
                }
                chaskiAssigner.send(['200', JSON.stringify(response)]);
                opts.busOps.notifyChaski(assignedChaski, to);
            }else{
                chaskiAssigner.send(['400', JSON.stringify({message:"action does not exist"})]);
            }
        });
    });

    return module;
};
