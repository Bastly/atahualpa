module.exports = function(opts) {

    var zmq = require('zmq');
    var constants = require('bastly_constants');
    var module = {};
    var defaultParams = {};
    var logHandler = require('../logHandler');
    var log = logHandler({name:'chaskiAssigner', log:opts.log}); 
    var apiKeyCheker = require('./apiKeyChecker');   

    // CHECKS
    if (!opts || !opts.busOps) {
        log.error('given opts insuficient:' + opts);
        throw new Error('opts insuficient, missing busOps');
    }
    
    var service = require('./services')({log:log, IP_CONSUL: opts.IP_CONSUL});

    var chaskiAssigner = zmq.socket('rep');
    var curacaCom = zmq.socket('req');
    curacaCom.connect('tcp://' + opts.curaca + ':' + constants.PORT_REQ_REP_ATAHUALPA_CURACA_COMM);

    log.info('curacaCom connected to: ', 'tcp://' + opts.curaca + ':' + constants.PORT_REQ_REP_ATAHUALPA_CURACA_COMM);

    module.close = function closeChaskiAssigner () {
        chaskiAssigner.close();
    };


    var getRandomInt = function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

    var getRandomService = function getRandomService(services, type){
        log.info('getting service', type, 'from', services);
        if(!services || !services[type] || services[type].nodes.length === 0){
            log.info('no worker found of type', type);
            return undefined;
        }else{
            var node = services[type].nodes[getRandomInt(0, services[type].nodes.length)]; 
            log.info('worker found for type', type, node);
            return  node;
        }
    };
    
    var chaskiAssignerUrl = 'tcp://*:' + constants.PORT_REQ_REP_ATAHUALPA_CLIENT_REQUEST_WORKER;
    chaskiAssigner.bind(chaskiAssignerUrl, function (err) {
        if (err) {
            throw err;
        }

        log.info('chaski assigner bound listening on', chaskiAssignerUrl);

        //when a message is reached, if the action is to subscribe it assigns a chaski using its chaskiId
        chaskiAssigner.on('message', function(action, to, from, apiKey, type) {
            log.info(chaskiAssigner.identity, ': received action', action.toString(), 'with chaskiType', type.toString());
            log.info('app key: ', apiKey.toString());

            if(action.toString() == 'subscribe'){
                service.getServices(true, function(services){
                    var node = getRandomService(services, type.toString());
                    if(node){
                        response = { ip: node.ip };
                        assignedChaski = node.id;
                        chaskiAssigner.send(['200', JSON.stringify(response)]);
                        // inform chaski that has to listen to given channel cause a user will connect
                        opts.busOps.notifyChaski(assignedChaski, to);

                        // notify security module (curaca) that new id is listening to  channel
                        curacaCom.send([constants.CURACA_TYPE_SUBSCRIPTION, to, from, apiKey]);
                        
                        log.info('node found', node, 'for service', type.toString());
                    } else {
                        chaskiAssigner.send(['400', JSON.stringify({"message":"there is no available worker for: " + type.toString()})]);
                    }
                });
            }else{
                log.info('action received does not exist', action.toString());
                chaskiAssigner.send(['400', JSON.stringify({"message":"action does not exist"})]);
            }
        });
    });

    return module;
};
