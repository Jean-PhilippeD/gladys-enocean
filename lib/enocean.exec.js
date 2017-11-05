var shared = require('./enocean.shared.js');
var Promise = require('bluebird');
var Button = require( "node-enocean-button" )
const sep = shared.separator;

module.exports = function exec(options) {
    var enocean = shared.enocean;

    if (!enocean) return Promise.reject('Enocean instance not connected !');

    // separate identifier

    var arr = options.deviceType.deviceTypeIdentifier.split(sep);

    for (var type in shared.types) {
        if(shared.types[type].type === arr[1]) {
            for (var state in shared.types[type].values) {
                if(shared.types[type].values[state] === options.state.value) var val = state;
            }
        }
    }

    sails.log.info('Enocean : sendng ' + val + ' to ' + arr[0]);

    var button = new Button( enocean , arr[0] )  
    if (val.match(/A1/g)) button.A1.click()
    if (val.match(/A0/g)) button.A0.click()
    if (val.match(/B0/g)) button.B0.click()
    if (val.match(/B1/g)) button.B1.click()

    // We return true because Zwave has a State feedback. 
    // So device Exec should not create deviceState*/
    return Promise.resolve(true);
}
