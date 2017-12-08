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
            
            enocean.on("known-data", function(data){

                sails.log.info('Enocean : Telegram received');
                sails.log.debug(data);

                //Hack for d2-01-12  and f6-02
                if (data.sensor.eep.match(/f6-02/)) {
                  data.values[0].type = 'switch';
                }
                if (data.sensor.eep.match(/d2-01/)) {
                  data.values[0].type = 'actuator';
                  if(data.packetTypeString === 'RPS'){
                    if (data.raw === '00') {
                      data.values[0].value = 'A0';
                    } else {
                      data.values[0].value = 'A1';
                    }
                  } else {
                    if (data.raw === '0461800189dac70101') {
                      data.values[0].value = '0';
                    } else {
                      data.values[0].value = 'A1';
                    }
                  }
                }

                data.values.map(function(value) {
                    if(!data.senderId.match(/ffc7/)) {
                        try {
                            var val = value.value;
                            if (isNaN(val)) val = shared.types[value.type].values[val];
                           return gladys.deviceState.createByDeviceTypeIdentifier(data.senderId + sep + shared.types[value.type].type, 'enocean', {value: val});
                        } catch(err) {
                            sails.log.warn(err);
                            sails.log.warn('Enocean : type unknown, skipping...');
                        }
                    }
                });

            })

            enocean.on("unknown-data", function(data) {
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

                if (sensor.eep.match(/d2-01-/)) { // Hack because values are unset when teaching
                    sensor.values = [ { type: 'actuator', unit: '', value: 2 } ]
                    sensor.desc = sensor.desc || 'New actuator';
                } else if (sensor.eep.match(/f6-02/)) {
                    sensor.values = [ { type: 'switch', unit: '', value: 5 } ]
                    sensor.desc = sensor.desc || 'New switch';
                } else {
                    sensor.values = enocean.getData(sensor.eep, sensor.id);
                }
                if (!sensor.id.match(/ffc7/)) saveDeviceInGladys(sensor); // save only if real device, virtual button starts with ffc7
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
        enocean.forget(sensor.id);
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
                return Promise.resolve();
            }
        })
    })
    .catch((err) => {
      sails.log.error(err)
      enocean.forget(sensor.id);
    });
}
    
