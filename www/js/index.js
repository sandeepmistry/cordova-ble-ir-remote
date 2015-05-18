/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var IR_SERVICE_UUID               = '00004952-0000-bbbb-0123-456789abcdef';
var IR_OUTPUT_CHARACTERISTIC_UUID = '00004953-0000-bbbb-0123-456789abcdef';
var IR_INPUT_CHARACTERISTIC_UUID  = '00004954-0000-bbbb-0123-456789abcdef';

var app = {
    // Application Constructor
    initialize: function() {
        // setup vars
        this.deviceId = null;
        this.lastButtonId = null;
        this.programMode = false;

        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);

        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }

        // hook up button listeners
        var buttons = document.querySelectorAll('button');

        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('click', this.onButtonClicked.bind(this, buttons[i]), false);
        }
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // start scanning for peripheral
        app.scan();
    },
    scan: function() {
        // reset
        app.deviceId = null;
        app.programMode = false;
        app.lastButtonId = null;

        // show scanning
        app.showElementById('scanning');

        ble.startScan([IR_SERVICE_UUID], function(device) {
            ble.stopScan();

            // discovered device
            app.deviceId = device.id;

            // hide scanning
            app.hideElementById('scanning');

            // connect
            app.connect();
        }, function() {
            console.log('JS: startScan error');
        });
    },
    connect: function() {
        // show connecting
        app.showElementById('connecting');

        ble.connect(app.deviceId, function(device) {
            // hide connecting, show connected
            app.hideElementById('connecting');
            app.showElementById('connected');

            app.updateActionButtons();

            // start listening to input
            ble.startNotification(app.deviceId, IR_SERVICE_UUID, IR_INPUT_CHARACTERISTIC_UUID, app.onIrInputNotify);
        }, function() {
            // hide connected and connecting
            app.hideElementById('connecting');
            app.hideElementById('connected');

            // restart scanning
            app.scan();
        });
    },
    updateActionButtons: function() {
        var actionButtons = document.querySelectorAll('button.action');

        for (var i = 0; i < actionButtons.length; i++) {
            var actionButton = actionButtons[i];
            var id = actionButton.id;

            var programMode = (app.lastButtonId === null) || (app.lastButtonId === id);
            var isProgrammed = (localStorage.getItem(id) !== null);

            var enabled = app.programMode ? programMode : isProgrammed;

            actionButton.disabled = !enabled;

            if (app.programMode && programMode) {
                actionButton.classList.add('program-mode');
            } else {
                actionButton.classList.remove('program-mode');
            }
        }
    },
    onButtonClicked: function(button) {
        var buttonId = button.id;

        if (buttonId === 'program') {
            app.programMode = !app.programMode;
            app.lastButtonId = null;

            app.updateActionButtons();
        } else if (app.programMode) {
            app.lastButtonId = buttonId;

            app.updateActionButtons();
        } else {
            var hexDataString = localStorage.getItem(buttonId);

            if (hexDataString) {
                // have a stored button
                var buffer = app.hexStringToBuffer(hexDataString);

                app.sendCode(buffer);
            }
        }
    },
    sendCode: function(buffer) {
        // write
        ble.write(app.deviceId, IR_SERVICE_UUID, IR_OUTPUT_CHARACTERISTIC_UUID, buffer);
    },
    onIrInputNotify: function(buffer) {
        // got a notification from the receiver

        var string = app.bufferToHexString(buffer);

        if (app.lastButtonId) {
            // store value for button in program mode
            localStorage.setItem(app.lastButtonId, string);

            // exit program mode
            app.programMode = false;
            app.lastButtonId = null;

            app.updateActionButtons();
        }
    },
    showElementById: function(id) {
        document.getElementById(id).classList.remove('hidden');
    },
    hideElementById: function(id) {
        document.getElementById(id).classList.add('hidden');
    },
    hexStringToBuffer: function(string) {
        // convert hex string to array
        var data = new Uint8Array(string.length / 2);

        for (var i = 0, j = 0; i < string.length; i += 2, j++) {
            data[j] = parseInt(string.substr(i, 2), 16);
        }

        return data.buffer;
    },
    bufferToHexString: function(buffer) {
        // convert buffer to hex string
        var data = new Uint8Array(buffer);
        var string = '';

        for (var i = 0; i < data.length; i++) {
            if (data[i] < 0x10) {
                string += '0';
            }

            string += data[i].toString(16);
        }

        return string;
    }
};

app.initialize();