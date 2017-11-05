var shared = require('./enocean.shared.js');
var Promise = require('bluebird');

module.exports = function learn(data) {
    var enocean = shared.enocean;
    sails.log.info('Enocean : Trying to manually learn device');

    if (!data.id && !data.eep) return Promise.reject('Enocean id and/or eep not provided for manual learn !');
    if (!enocean) return Promise.reject('Enocean instance not connected !');

    return enocean.learn({
        id: data.id.toLowerCase(),
        eep: data.eep.toLowerCase(),
        desc: data.desc,
        manufacturer: data.manufacturer
    });
}
