# Gladys EnOcean (Alpha)

Gladys hooks to control EnOcean devices.

Remember : This module is still in Alpha :)

## Documentation

### Installation

- Plug your EnOcean USB stick on your Raspberry Pi
- Find the name of the USB port the stick is connected to (it looks like `/dev/ttyACM0`). 
You can try to execute `ls /dev/tty*` before and after pluggging the USB stick to find which port it is.
- Create a parameter in Gladys by going to "Parameters" => "Parameters", and create a key-value store : 
key = "enocean_usb_port", value = "THE_USB_PORT_NAME_YOU_FOUND"
- Install the module in Gladys in the store view.
- Reboot Gladys

### Usage

- At Gladys Startup, the EnOcean stick is put in Learning mode during 60s.
- You can learn your new devices during this period.

- To add other EnOcean devices later (without restating Gladys), go to "Modules" 
and click on the "Configuration" button on the EnOcean module row, it will put the stick in Learning mode during 60s.

- You can also learn new devices by hand, through a Gladys script :

> gladys.modules.enocean.learn({
>     id: "your device id",
>     eep: "your device eep",
>     manufacturer: "manufacturer- not mandatory",
>     desc: "the name you want to give for your device"
> })

### Additionnal Informations

Each EnOcean state is mapped to int value in Gladys.

- open: 1
- closed: 0

- on: 1
- off: 0

- A0: 1
- A1: 2
- B0: 3
- B1: 4


Devices currently supported:
- a5-07-01
- a5-02-05
- d5-00-01
- f6-02-03

Others devices may works. Just tell me :)
