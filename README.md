# cordova-ble-ir-remote

## Setup

### Cordova

 1. Clone repo
 2. ```cd``` to repo dir.
 3. Add platform support
    * Android: ```cordova platform add android```
    * iOS: ```cordova platform add ios```
 4. Add [ble-central plugin](https://github.com/don/cordova-plugin-ble-central): ```cordova plugin add com.megster.cordova.ble```
 5. Run:
    * Android: ```cordova run android --device```
    * iOS: ```cordova run ios --device```

### Arduino

 1. Setup [ir_bridge.ino](https://github.com/sandeepmistry/arduino-BLEPeripheral/blob/master/examples/ir_bridge/ir_bridge.ino) example sketch from [arduino-BLEPeripheral](https://github.com/sandeepmistry/arduino-BLEPeripheral) 

## Usage

### Program mode

 1. Press "Program Mode" button, buttons turn blue.
 2. Press button you wish to program, selected button turns green.
 3. Point regular IR remote at IR receiver attached to Arduino, press button the remote.
 4. All buttons return gray, value for button saved in app.
 
### Regular mode

 1. Tap programmed button, saved IR single from program mode sent.
