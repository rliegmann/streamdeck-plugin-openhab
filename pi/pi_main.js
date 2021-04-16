
// Global web socket
var websocket = null;

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    var actionInfo = JSON.parse(inActionInfo);
    var info = JSON.parse(inInfo);

    var streamDeckVersion = info['application']['version'];
    var language = info['application']['language'];
    var pluginVersion = info['plugin']['version'];

    var action = actionInfo['action'];

    console.log("connectElgateStreamDeckSocket->  inPort: " + inPort + " inRegisterEvent: " + inRegisterEvent + " inActionInfo: " + inActionInfo)

    websocket = new WebSocket('ws://127.0.0.1:' + inPort);

    websocket.onopen = function () {
        var json = {
            event: inRegisterEvent,
            uuid: inUUID
        };
        websocket.send(JSON.stringify(json));
    }


    var pi;

    if (action === 'com.temp.openhab.lable') {
        pi = new PI_Lable(inUUID, language);
    }


    websocket.onmessage = function (evt) {
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj["event"];
        var payload = jsonObj["payload"];

        if(event === 'didReceiveGlobalSettings') {
            
        }
        else if(event === 'didReceiveSettings') {
            
        }
        else if(event === 'sendToPropertyInspector') {
           pi.handleSendToPropertyInspector(payload)
        }
    }
}

function SendSettings(action, context, inPayload) {
    if (websocket) {
        let payload = {};
        payload.type = "updateSettings";
        payload.data = inPayload;
        const json = {
            "action": action,
            "event": "sendToPlugin",
            "context": context,
            "payload": payload,
        }
        console.log("Send new Settings to Plugin: ");
        console.log(json);
        websocket.send(JSON.stringify(json));
    }
}

function RequestSettings(action, context) {
    if (websocket) {
        let payload = {};
        payload.type = "requestSettings";
        const json = {
            "action": action,
            "event": "sendToPlugin",
            "context": context,
            "payload": payload,
        }
        console.log("Request Settings from Plugin");
        websocket.send(JSON.stringify(json));
    }
}

function GetAvailableItems(action, context) {
    if (websocket) {
        let payload = {};
        payload.type = "availableItems";
        const json = {
            "action": action,
            "event": "sendToPlugin",
            "context": context,
            "payload": payload,
        }
        websocket.send(JSON.stringify(json));
    }
}