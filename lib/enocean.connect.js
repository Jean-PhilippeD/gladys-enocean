var shared = require('./enocean.shared.js');
var enocean = require('node-enocean')({sensorFilePath : sails.config.appPath + '/' +shared.sensorsFile});
const sep = shared.separator;

module.exports = function connect() {

    return gladys.param.getValue(shared.gladysUsbPortParam)
        .then((usbPort) => {

            enocean.listen(usbPort);

            enocean.on("ready",function(){
                enocean.timeout=120
                enocean.startLearning()
                // we control known sensors ae the sameas known sensors from Gladys
                var knownSensors = enocean.getSensors();

                gladys.device.getByService({service: 'enocean'})
                .then((devices) => {

                    return Promise.map(devices, function(device) {
                        if (!knownSensors[device.identifier.split(sep)[0]]) {
                            // sensor is known by gladys but not for the module, we gonna manually learn it
                            enocean.learn({
                                id: device.identifier.split(sep)[0],
                                eep: device.identifier.split(sep)[1],
                                desc: device.name,
                                manufacturer: '-'
                            });
                         } 
                    });
                });
            })

            enocean.on("error", function(err) {
                sails.log.error(err);
            });
            
            enocean.on("known-data",async function(data){

                sails.log.info('Enocean : Telegram received');

                data.values.map(function(value) {
                    if (shared.types[value.type]) {
                        var val = value.value;
                        if (isNaN(val)) val = shared.types[value.type].values[val];
                        return gladys.deviceState.createByDeviceTypeIdentifier(data.senderId + sep + shared.types[value.type].type, 'enocean', {value: val});
                    } else {
                        sails.log.warn('Enocean : type unknown, skipping...');
                        sails.log.warn(value);
                    }
                });

            })

            enocean.on("unknown-data", async function(data) {
                sails.log.warn("Enocean : Unknowndata received:", data)
            })
            
            enocean.on("unknown-teach-in",function(data){
                console.log("unknown teach in: ",data)
            })
            
            enocean.on("learn-mode-start",function(){
                sails.log.info("EnOcean : Learning started, press a teach in button on a device...")
            })
            
            enocean.on("learn-mode-stop",function(data){
                sails.log.info("EnOcean : Learning stoped: ",data.reason)
            })
            
            enocean.on("learned",function(sensor){
                sails.log.info("EnOcean : Device Learned: ", sensor);
                if (sensor.title === 'New RPS Switch') {
                    sensor.values = [ { type: 'state', unit: '', value: 'released' } ]
                    sensor.desc = 'Rocker switch';
                } else {
                    sensor.values = enocean.getData(sensor.eep, sensor.id);
                }
                saveDeviceInGladys(sensor);
           })

           enocean.on("forgotten",function(data){
                console.log("forgotten: ",data)
            })

            shared.enocean = enocean;

        });
}
      

saveDeviceInGladys = function(sensor) {

    var enocean = shared.enocean;

    var newDevice = {
        device: {
            name: sensor.desc,
            protocol: 'enocean',
            service: 'enocean',
            identifier: sensor.id + sep + sensor.eep
        },
        types: []
    };

    sensor.values.map(function(value) {

        if (shared.types[value.type]) {

            var v = shared.types[value.type];

            newDevice.types.push({
                 name: v.name,
                 type: v.type,
                 sensor: v.sensor,
                 unit: value.unit,
                 min: v.min,
                 max: v.max,
                 display: v.display,
                 identifier: sensor.id + sep + v.type
            });
        }
    });

    if (newDevice.types.length == 0) {
        sails.log.error(sensor);
        return Promise.reject("Enocean : No deviceTypes known !");
    }
     
    return gladys.device.create(newDevice)
    .then(() => {
        return Promise.map(sensor.values, function(value) {
            if (shared.types[value.type]) {
                var val = value.value;
                if (isNaN(val)) {
                     try {
                         val = shared.types[value.type].values[val];
                     }
                     catch(err) {
                         val = 0;
                     }
                }
                return gladys.deviceState.createByDeviceTypeIdentifier(sensor.id + sep + shared.types[value.type].type, 'enocean', {value: val});
            } else {
                sails.log.warn('Enocean : type unknown, skipping...');
                sails.log.warn(value);
                return Promise.resolve();
            }
        })
    })
    .catch((err) => sails.log.error(err));
}
    
