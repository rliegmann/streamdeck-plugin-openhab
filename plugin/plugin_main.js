// Global web socket
var websocket = null;

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    
    var gSettings = {};
    var actions = {};
    var openHabConnector = new OpenHabConnector2();

    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    // ToTo  use a global function for plugin and pi regestration
    websocket.onopen = function() {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
        websocket.send(JSON.stringify(json));
    }

    websocket.onmessage = function(inEvent) {
        //Recevied messages from Stream Deck
        var jsonObj = JSON.parse(inEvent.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'];

        console.log("Incomming Message");
        console.log(event);

        // Key up event
        if(event == 'keyUp') {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];

            if(context in actions) {
                actions[context].onKeyUp(context);
            }
        }
        else if (event == 'keyDown') {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];
            var userDesiredState = jsonPayload['userDesiredState'];

            if(context in actions) {
                actions[context].onKeyDown(context);
            }
        }
        else if (event == 'willAppear') {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];

            if (!(context in actions)) {
                if(action == 'com.temp.openhab.lable') {
                    actions[context] = new ActionLable(context, action, settings, coordinates, openHabConnector);
                }
                else if (action == 'com.temp.openhab.switch') {
                    actions[context] = new ActionSwitch(context, action, settings, coordinates, openHabConnector);
                }
            }
        }
        else if (event == 'willDisappear') {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];

            // Do close connections to all services for context
            if (context in actions) {
                actions[context].Stop();
                delete actions[context];
            }
        }
        else if (event == 'propertyInspectorDidAppear') {
            actions[context].GetAvailableItems();
        }
        else if (event == 'propertyInspectorDidDisappear') {

        }
        else if (event === 'didReceiveGlobalSettings') {
            gSettings = jsonPayload['settings'];
        }
        else if (event == 'sendToPlugin') {
            console.log("Plugin:    SendToPlugin:  " + jsonPayload['type']);

            if (jsonPayload['type'] == "updateSettings") {
                actions[context].SetNewSettings(jsonPayload.data);
            }
            else if (jsonPayload['type'] == "requestSettings") {
                actions[context].SendSettings();
            }
            else if (jsonPayload['type'] == "availableItems") {
                actions[context].GetAvailableItems();
            }
        }


    }
}