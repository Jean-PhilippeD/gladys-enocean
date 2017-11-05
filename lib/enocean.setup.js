var shared = require('./enocean.shared.js');
var Promise = require('bluebird');

module.exports = function learn(data) {
    var enocean = shared.enocean;

    if (!enocean) return Promise.reject('Enocean instance not connected !');

    var learn = Promise.promisify(enocean.startLearning);
    return learn();
}
