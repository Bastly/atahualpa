var fs = require('fs');
var assert = require("assert");
var argv = require('optimist').demand('config').argv;
var testConfig = argv.config;
assert.ok(fs.existsSync(testConfig), 'config file not found at path: ' + testConfig);
var config = require('nconf').env().argv().file({file: testConfig});

console.log(config.api);

if(!config.api.key){
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