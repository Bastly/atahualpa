module.exports = function(opts){
    var logHandler = require('../logHandler');
    var log = logHandler({name:'services', log:opts.log});
    if(!opts || !opts.IP_CONSUL){
        log.info('IP-consul not given, returning mock services');
        return require('./servicesMock')({log:log});
    }else{
        log.info('IP-consul given, returning services mock');
        return require('./servicesConsul')({log:log, IP_CONSUL:opts.IP_CONSUL});
    }
};
