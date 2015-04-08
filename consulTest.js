var consul = require('consul')();

consul.agent.join('192.168.0.115', function(err) {
  if (err) throw err;
    consul.catalog.service.list(function(err, result) {
      if (err) throw err;
        console.log(result);
    });

    consul.catalog.service.nodes('example', function(err, result) {
      if (err) throw err;
        console.log(result);
    });
});

