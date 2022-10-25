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

        GetGlobalSettings(inPluginUUID);
    }

    websocket.onmessage = function(inEvent) {
        //Recevied messages from Stream Deck
        var jsonObj = JSON.parse(inEvent.data);
        var event = jsonObj['event'];
        var action = jsonObj['action'];
        var context = jsonObj['context'];
        var jsonPayload = jsonObj['payload'];

        console.log("Incomming Message: " + event);
        

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
                if(action == 'com.rliegmann.openhab.lable') {
                    actions[context] = new ActionLable(context, action, settings, coordinates, openHabConnector);
                }
                else if (action == 'com.rliegmann.openhab.switch') {
                    actions[context] = new ActionSwitch(context, action, settings, coordinates, openHabConnector);
                }
            }
        }
        else if (event == 'willDisappear') {
            var settings = jsonPayload['settings'];
            var coordinates = jsonPayload['coordinates'];

            // Do close connections to all services for context
            if (context in actions) {
                //actions[context].Stop();
                //delete actions[context];
            }
        }
        else if (event == 'propertyInspectorDidAppear') {
            actions[context].GetAvailableItems();
        }
        else if (event == 'propertyInspectorDidDisappear') {

        }
        else if (event === 'didReceiveGlobalSettings') {
            gSettings = jsonPayload['settings'];


            Object.keys(openHabConnector.Servers).forEach(element => {
                if ( !(element in gSettings.servers) ) {
                    
                    Object.entries(actions).forEach(element2 => {
                        console.log("LOOP Action");
                        if ( !(element in element2)) {
                            console.log("JAAAAAAAAAA zum löschen");
                            
                            
                        }
                    })
                    /*
                    actions.forEach ((act, index) => {
                        if ( !(act.openHabConnector in openHabConnector.Servers)) {
                            console.log("JAAAAAAAAAA zum löschen");
                        }
                      });
                   */                   
                    openHabConnector.DeregisterServer(element);
                }
            });

            Object.keys(gSettings.servers).forEach(entry => {            
                console.log(gSettings.servers[entry]);    
               
               if ( !(entry in openHabConnector.Servers) ) {                
                   openHabConnector.RegisterServer(entry, gSettings.servers[entry].protocoll, gSettings.servers[entry].url, gSettings.servers[entry].name);
               }
               
            })

            Object.keys(actions).forEach(entry => {   
                if (!entry.isInitialized)   {       
                    console.log(actions[entry].RefreshOpenhabConnection());   
                } 
                             
            })
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

function GetGlobalSettings(uuid) {
    if (websocket) {
        var json = {
            'event': 'getGlobalSettings',
            'context': uuid
        };

        websocket.send(JSON.stringify(json));
    }
}