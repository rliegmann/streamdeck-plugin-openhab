let initConfig = {
    openhab_server: "http://openhab:8080",
    openhab_item: "---",
};

function Action(inAction, inContext, settings, coordinates, openhabConnector) {
    var action = inAction;
    var context = inContext;
    var settingsCache = {};
    var OpenhabConnector = openhabConnector;
    var _events = {};

    settingsCache = { openhab_server: initConfig.openhab_server,
                        openhab_item: initConfig.openhab_item}; // Deep copy!!

    if (Object.keys(settings).length === 0) {
        console.log("Init Action");
    }

    if (settings.hasOwnProperty('openhab_server')) {
        settingsCache.openhab_server = settings["openhab_server"];
    }
    if (settings.hasOwnProperty('openhab_item')) {
        settingsCache.openhab_item = settings["openhab_item"];
    }

    RefreshOpenhabConnection();

    // Event Handler
    this.on = function(name, listener) {
        if (!_events[name]) {
          _events[name] = [];
        }
    
        _events[name].push(listener);
    }

    this.removeListener = function(name, listenerToRemove) {
        if (!_events[name]) {
          throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
        }
    
        const filterListeners = (listener) => listener !== listenerToRemove;
    
        _events[name] = _events[name].filter(filterListeners);
    }

    function emit(name, data) {
        if (!_events[name]) {
          throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
        }
    
        const fireCallbacks = (callback) => {
          callback(data);
        };
    
        _events[name].forEach(fireCallbacks);
    }

    async function RefreshOpenhabConnection() {
        if (OpenHabConnector.Server != settingsCache.openhab_server) {
            OpenhabConnector.RegisterServer(settingsCache.openhab_server);
        }


        OpenhabConnector = new OpenHabConnector(settingsCache.openhab_server, inContext);
        if (settingsCache.openhab_item == "---") {

        }   
        else {
            var state = await OpenhabConnector.GetCurrentStatus(settingsCache.openhab_item);
            var item = {value: state.state}; // THIS is not the findale  Change this
            emit("onItemStateChanged", item);

            OpenhabConnector.AddItemListener(settingsCache.openhab_item);
            OpenhabConnector.on('testEvent', function(context, data) {
                emit("onItemStateChanged", data);
            });
        }  
    }
    
    this.GetAvailableItems = function (itemType) {
        var type = null;

        switch (action) {
            case "com.temp.openhab.lable":
                type = ITEM_TYPE.NONE;
                break;
            case "com.temp.openhab.switch":
                type = ITEM_TYPE.SWITCH;
                break;        
            default:
                type = ITEM_TYPE.NONE;
                break;
        }

        var payload = {};
        payload.data = [];
        payload.type = "getAvailableItemsResponse";
        payload.failed = false;   // Change this in future
        
        OpenhabConnector.GetAvailableItems(type)
        .then((data) => {
            data.forEach(function(entry) {
                payload["data"].push( {name: entry["name"] } );
            })
            this.SendToPI(action, payload);
        })
        .catch((error) => {
            payload["data"].push( {error: error.message } );
			payload.failed = true;
            this.SendToPI(action, payload);
        });  
        
    }

    this.GetCurrentStatus = async function() {
        return await OpenhabConnector.GetCurrentStatus(settingsCache.openhab_item);
    }

    this.SendComandToItem = function(itemType, command) {
        var openhabItemType = ITEM_TYPE.NONE;
        switch (itemType) {
            case 'switch': openhabItemType = ITEM_TYPE.SWITCH;                
                break;        
            default:
                return;
        }
        OpenhabConnector.SendCommandToItem(openhabItemType, command);
    }
    
    this.SendToPI = function(action, payload) {
        if(websocket) {
            var json = {
                'action': action,
                'event': 'sendToPropertyInspector',
                'context': context,
                'payload': payload
            };
            console.log("SendToPropertyInspector");
            console.log(json);
            websocket.send(JSON.stringify(json));
        }
    }

    this.SetTitle = function(payload) {
        if (websocket) {
            var json = {
                'event': 'setTitle',
                'context': context,
                'payload': payload
            }
            console.log("SetTitle: " + payload);
            websocket.send(JSON.stringify(json));
        }
    }

    this.SetState = function(state) {
        if (websocket) {
            var json = {
                event: 'setState',
                context: context,
                payload: {
                    state: state,
                } 
            }
            console.log("SetState: " + json);
            websocket.send(JSON.stringify(json));
        }
    }

    this.SetSettings = function() {
        if(websocket) {
            var json = {
                "event": "setSettings",
                "context": context,
                "payload": settingsCache
            }
            console.log("SetSettings: " + settingsCache);
            websocket.send(JSON.stringify(json));
        }
    }

    this.Stop = function() {
        OpenhabConnector.Close();
    }   
    

    Object.defineProperty(this, 'Settings', {
        get: function() { return settingsCache; },  //we can also use `return name;` if we don't use `name` input param for other purposes in our code
        set: function(value) {
            if (value.openhab_server != OpenhabConnector.Server() ||
                value.openhab_item != OpenhabConnector.Item() ) {
                    settingsCache = value;
                    RefreshOpenhabConnection();
            }
            this.SetSettings();
        }
        //writable: false, //if we need it to be read-only
        //... other configs
    });

    Object.defineProperty(this, 'ItemState', {
        get: function() { return OpenhabConnector.ItemState(); }
    })
    
}

