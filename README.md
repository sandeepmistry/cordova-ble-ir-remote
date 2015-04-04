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

### Regular mode

 1. Press black button to send programmed button IR signal.

__Note__: Unprogrammed buttons are disabled (grayed out).

### Program mode

 1. Press "Program" button, buttons turn blue.
 2. Press button you wish to program, selected button remains blue (others disabled).
 3. Point regular IR remote at IR receiver attached to Arduino, press button the remote.
 4. Value for button saved in app.
 5. App switches to regular mode.
