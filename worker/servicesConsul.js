module.exports = function(opts){
    if(!opts || !opts.IP_CONSUL){
         throw new Error('ip consul is needed');
    }
    var IP_CONSUL = opts.IP_CONSUL;
    var consul = require('consul')();
    var _ = require('underscore');
    var constants = require('bastly_constants');
    var logHandler = require('../logHandler');
    var log = logHandler({name:'servicesConsul', log:opts.log});
    var lastServiceCheck;
    log.info('quering services at', IP_CONSUL);

    var module = {};
    module.alive = {};

    var getServices = function getServices(forceUpdate, callback){
        if(forceUpdate){
            checkServices(callback);
        } else {
            callback(module.alive);
        }
    };

    log.info('quering services at', IP_CONSUL);
    var checkServices = function checkServices(callback){
        //get all the services
        consul.catalog.service.list(function(err, services) {
            if (err) throw err;
            //deferring callback until all services have been loaded
            if (callback) {
                var callbackDeffered = _.after(Object.keys(services).length, function(){
                    callback(module.alive);
                });
            }
            _.each(services, function(tag, service){
                //and filter only the alive ones
                consul.health.service(service, function (err, nodes) {
                    if (err) throw err;
                    var aliveNodes = [];
                    _.each(nodes, function(node){
                        var serviceInNodeIsAlive = true;
                        _.each(node.Checks, function(check){
                            if(check.Status !== 'passing'){
				if(check.CheckID !== "serfHealth"){
                                	serviceInNodeIsAlive = false;
				}
                            }
                        });
                        if (serviceInNodeIsAlive) {
                            aliveNodes.push({ip:node.Service.Address, id: node.Service.ID});
                        }
                    });
                    //update the passed variable to new values
                    module.alive[service] = module.alive[service] || {};
                    module.alive[service].nodes = aliveNodes;
                    callbackDeffered();
                });
            });
        });
    };

    consul.agent.join(IP_CONSUL, function(err) {
        if (err) throw err;
    });

    //periodically update the services variable
    setInterval(function(){
        checkServices(function (){
            log.debug(module.alive, 'alive services');
        });
    }, 5000);

    module.getServices  = getServices;
    return module;
};
