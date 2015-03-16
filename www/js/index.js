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

var SCANNING_INTERVAL             = 5; //seconds

var IR_SERVICE_UUID               = '4952';
var IR_OUTPUT_CHARACTERISTIC_UUID = '4953';
var IR_INPUT_CHARACTERISTIC_UUID  = '4954';

var app = {
    // Application Constructor
    initialize: function() {
        // setup vars
        this.deviceId = null;
        this.lastButtonId = null;
        this.programMode = false;

        // store elements for each screen
        this.scanningElement = document.getElementById('scanning');
        this.connectingElement = document.getElementById('connecting');
        this.connectedElement = document.getElementById('connected');

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

        console.log('Received Event: ' + id);

        // start scanning for peripheral
        app.scan();
    },
    scan: function() {
        // reset
        app.deviceId = null;
        app.programMode = false;
        app.lastButtonId = null;

        // show scanning
        app.scanningElement.style.display = '';

        console.log('JS: scan');
        ble.scan([IR_SERVICE_UUID], SCANNING_INTERVAL, function(device) {
            if (app.deviceId === null) {
                // discovered device
                console.log('JS: discovered device');
                console.log(device);

                app.deviceId = device.id;

                // hide scanning
                app.scanningElement.style.display = 'none';

                // connect
                app.connect();
            }
        }, function() {
            console.log('JS: scan error');
        });

        setTimeout(function() {
            if (app.deviceId == null) {
                console.log('JS: scan timeout');

                // scan timed out, restart
                app.scan();
            }
        }, SCANNING_INTERVAL * 1000 + 100);
    },
    connect: function() {
        // show connecting
        app.connectingElement.style.display = '';

        console.log('JS: connect');
        ble.connect(app.deviceId, function(device) {
            console.log('JS: connected');
            // hide connecting, show connected
            app.connectingElement.style.display = 'none';
            app.connectedElement.style.display = '';

            // start listening to input
            ble.startNotification(app.deviceId, IR_SERVICE_UUID, IR_INPUT_CHARACTERISTIC_UUID, app.onIrInputNotify);
        }, function() {
            console.log('JS: disconnect or connection error');

            // hide connected and connecting
            app.connectedElement.style.display = 'none';
            app.connectingElement.style.display = 'none';

            // restart scanning
            app.scan();
        });
    },
    onButtonClicked: function(button) {
        var buttonId = button.id;
        var buttons = document.querySelectorAll('button');

        if (buttonId === 'program-mode') {
            app.programMode = !app.programMode;

            // toggle program mode
            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].id !== 'program-mode') {
                    buttons[i].style.backgroundColor = this.programMode ? '#55f' : '#eee';
                }
            }

            app.lastButtonId = null;
        } else if (app.programMode) {
            // select button to program
            for (var i = 0; i < buttons.length; i++) {
                if (buttons[i].id !== 'program-mode') {
                    buttons[i].style.backgroundColor = (buttons[i].id === buttonId) ? '#5f5' : '#eee';
                }
            }

            // store
            app.lastButtonId = buttonId;
        } else {
            var dataStr = localStorage.getItem(buttonId);

            if (dataStr) {
                // have a stored button

                // convert hex string to array
                var data = new Uint8Array(dataStr.length / 2);

                for (var i = 0, j = 0; i < dataStr.length; i += 2, j++) {
                    data[j] = parseInt(dataStr.substr(i, 2), 16);
                }

                // write
                ble.write(app.deviceId, IR_SERVICE_UUID, IR_OUTPUT_CHARACTERISTIC_UUID, data.buffer);
            }
        }
    },
    onIrInputNotify: function(buffer) {
        // got a notification from the receiver
        console.log('JS: notification data');

        // convert buffer to hex string
        var data = new Uint8Array(buffer);
        var dataStr = '';

        for (var i = 0; i < data.length; i++) {
            if (data[i] < 0x10) {
                dataStr += '0';
            }

            dataStr += data[i].toString(16);
        }

        console.log('JS: IR in ' + dataStr);

        if (app.lastButtonId) {
            // store value for button in program mode
            localStorage.setItem(app.lastButtonId, dataStr);

            // exit program mode
            app.lastButtonId = null;
            app.programMode = false;

            var buttons = document.querySelectorAll('button');

            for (var i = 0; i < buttons.length; i++) {
                buttons[i].style.backgroundColor = '#eee';
            }
        }
    }
};

app.initialize();