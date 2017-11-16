# Gladys EnOcean (alpha)

Gladys hooks to control EnOcean devices.

**Remember:**
This module is still in Alpha.
If you have any devices (eep) which does not work, don't hesitate to open an issue so we'll work to add support

## Installation

- Plug your EnOcean USB stick on your Raspberry Pi
- Find the name of the USB port where the stick is connected to (it looks like `/dev/ttyACM0`, you can rename through udev rules). 
You can try to execute `ls /dev/tty*` before and after pluggging the USB stick to find which port it is.
- Create a parameter in Gladys by going to "Parameters" => "Parameters", and create : 

| Key | Value |
| ------ | ------ |
| enocean_usb_port | THE_USB_PORT_NAME_YOU_FOUND |

- Install the module in Gladys in the store view.
- Reboot Gladys


## Usage

#### How to learn device
-  **Learning mode** is automatically set for **60s** at Gladys Startup
-  To manually set the **learning mode**, go to **Modules** and click on the **Configuration** button on the EnOcean module row, it will put the stick in **Learning** mode during **60s**.
- You can also learn new devices **by hand**, through a Gladys script :

```sh
$ gladys.modules.enocean.learn({
   id: "your device id",
   eep: "your device eep",
   manufacturer: "manufacturer- not mandatory",
   desc: "the name you want to give for your device"
})
```

- You can remove/forget a device by script:

 ```sh
$ gladys.modules.enocean.forget({
   id: "your device id",
})
```

#### How devices works

- Each EnOcean device state is mapped to an integer value in Gladys (as Gladys works with Int).

| Status | Value |
| ------ | ------ |
| open | 1 |
| closed | 0 |
| on | 1 |
| off | 0 |
| A0 | 1 |
| A1 | 2 |
| B0 | 3 |
| B1 | 4 |
| released | 5 |

- Devices currently supported:

| eep |
| ------ |
| a5-07-01 |
| a5-02-05 |
| d5-00-01 |
| f6-02-03 |
| d2-xx-xx (partially) |

Others devices may works. It's based on node-enocean which support a lot of equipments.
I've just tested with mine.

If you have any devices which does not work, don't hesitate to open an issue so we'll work to add support

##### To use an actuator device like this one:
http://nodon.fr/enocean/module-encastre-enocean-1-canal_16-1

 - You have to bind the device with Gladys in order to control it (2-ways learning):
   - Learn the device in Gladys __(learn the device on Gladys side)__
   - Put the device in learning state by following the method
   - Send a **On** order to the device, it will bind the device to Gladys __(learn Gladys on device side)__

```sh
$ gladys.deviceType.exec({
   id: "your device id",
   value: 1 // means A0
})
```
Be carefull to send a **On value** (ie: A0), if you send a **Off value** (A1) it will bind the device in the wrong way.
