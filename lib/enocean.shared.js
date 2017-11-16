module.exports = {
    enocean: null,
    gladysUsbPortParam: 'enocean_usb_port',
    sensorsFile: 'cache/enocean_sensors.json',
    separator: '/',
    buttons: {},
    types: {
        "Contact": {
            name: "Contact",
            type: "binary",
            sensor: true,
            min: 0,
            max: 1,
            display: true,
            values: {
                open: 1,
                closed: 0
            }
        },
        "Voltage": {
            name: "Voltage",
            type: "voltage",
            sensor: true,
            min: 0,
            max: 100,
            display: true
        },
        "Supply voltage": {
            name: "Voltage",
            type: "voltage",
            sensor: true,
            min: 0,
            max: 100,
            display: true
        },
        "Temperature": {
            name: "Temperature",
            type: "temperature",
            sensor: true,
            min: -10,
            max: 50,
            display: true
        },
        "PIR Status": {
            name: "Occupation",
            type: "binary",
            sensor: true,
            min: 0,
            max: 1,
            display: true,
            values: {
                on: 1,
                off: 0
            }
        },
        "switch": {
            name: "Switch",
            type: "switch",
            sensor: false,
            min: 1,
            max: 6,
            display: true,
            values: {
                "A0 down": 1,
                "A1 down": 2,
                "B0 down": 3,
                "B1 down": 4,
                "released": 5
            }
        },
        "actuator": {
            name: "Actuator",
            type: "actuator",
            sensor: false,
            min: 1,
            max: 5,
            display: true,
            values: {
                "A0": 1,
                "A1": 2,
                "B0": 3,
                "B1": 4
            }
        }
    }

};
