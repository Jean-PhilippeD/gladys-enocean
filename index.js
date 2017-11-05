

module.exports = function (sails) {

    var connect = require('./lib/enocean.connect.js');
    var setup = require('./lib/enocean.setup.js');
    var learn = require('./lib/enocean.learn.js');
    var exec = require('./lib/enocean.exec.js');

    gladys.on('ready', function(){
        connect();
    });

    return {
        connect,
        setup,
        learn,
        exec
    };
};
