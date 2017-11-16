var shared = require('./enocean.shared.js');
var Promise = require('bluebird');

module.exports = function forget(data) {
    var enocean = shared.enocean;
    
    if (!data.id) return Promise.reject('Enocean id not provided for manual forget !');
    if (!enocean) return Promise.reject('Enocean instance not connected !');

    return enocean.forget(data.id.toLowerCase());
}
