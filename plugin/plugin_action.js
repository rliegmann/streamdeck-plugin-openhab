let initConfig = {
    openhab_server: "---",
    openhab_item: "---",
};

class ActionItemChangedEvent {
    constructor(item, data) {
        this.item = item;
        this.data = data;
    }
}

class ActionItemChangedEcentPayload {
    constructor(type, value, oldType, oldValue) {
        this.type = type;
        this.value = value;
        this.oldType = oldType;
        this.oldValue = oldValue;
    }
}

function Action(inAction, inContext, settings, coordinates, openhabConnector) {
    var action = inAction;
    var context = inContext;
    var settingsCache = {};
    var previousSettingsCache = {};
    var OpenhabConnector = openhabConnector;
    var _events = {};
    var isEventRegest = false;
    var isInitialized = false;
    var _currentItemState = null;

    previousSettingsCache = { openhab_server: '---',
                                openhab_item: '---'}; 

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

  
    const handleOpenHabEvent = (data) => {
        var obj = JSON.parse(data);
               
        var myRegexp =  RegExp("^(smarthome\/items\/(\w+)\/statechanged)$");
        const regexpWithoutE = /smarthome\/items\/(\w+)\/statechanged/;
        var match = obj.topic.match(regexpWithoutE);

        if (match[1] == settingsCache.openhab_item) {
            console.log(match[1]); // abc
            var payload = JSON.parse(obj.payload);
            _currentItemState = payload.value;
            emit("onItemStateChanged", new ActionItemChangedEcentPayload(payload.type, payload.value, payload.oldType, payload.oldValue));
        }
    };

    
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
            //var obj = JSON.parse(data);
          callback(data);
        };
    
        _events[name].forEach(fireCallbacks);
    }

    this.RefreshOpenhabConnection = async function() { 
        


        if (settingsCache.openhab_server === '---'  && previousSettingsCache.openhab_server === '---') {
            return;
        }  
        
        if ( previousSettingsCache.openhab_server != settingsCache.openhab_server && previousSettingsCache.openhab_server != '---' ) {
            OpenhabConnector.removeListener(previousSettingsCache.openhab_server +  '_ItemChanged');
            return;
        }

        if ( previousSettingsCache.openhab_server != settingsCache.openhab_server ) {
            OpenhabConnector.on(settingsCache.openhab_server + '_ItemChanged', handleOpenHabEvent);
        }

       
        if (settingsCache.openhab_item == "---") {
           this.GetAvailableItems();
        }   
        else {
            var state = await OpenhabConnector.GetCurrentStatus(settingsCache.openhab_server, settingsCache.openhab_item);
            var item = {value: state.state}; // THIS is not the findale  Change this
            _currentItemState = item.value;
            emit("onItemStateChanged", new ActionItemChangedEcentPayload("-", item.value, "-", "-"));

            if ( previousSettingsCache.openhab_item != settingsCache.openhab_item ) {
                OpenhabConnector.RemoveItemListener(settingsCache.openhab_server, previousSettingsCache.openhab_item);
                OpenhabConnector.AddItemListener(settingsCache.openhab_server, settingsCache.openhab_item);  

                this.isInitialized = true;
            }                
            
            
        }  
    }

       
    this.GetAvailableItems = function () {
        if (settingsCache.openhab_server === '---') {
            return;
        }

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
        
        OpenhabConnector.GetAvailableItems(settingsCache.openhab_server, type)
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
        return await OpenhabConnector.GetCurrentStatus(settingsCache.openhab_server, settingsCache.openhab_item);
    }

    this.SendComandToItem = function(itemType, command) {
        var openhabItemType = ITEM_TYPE.NONE;
        switch (itemType) {
            case 'switch': openhabItemType = ITEM_TYPE.SWITCH;                
                break;        
            default:
                return;
        }
        OpenhabConnector.SendCommandToItem(settingsCache.openhab_server, settingsCache.openhab_item, command);
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
        OpenhabConnector.RemoveItemListener(settingsCache.openhab_server, settingsCache.openhab_item);
        OpenhabConnector.removeListener(settingsCache.openhab_server + '_ItemChanged', handleOpenHabEvent);
    }   
    

    Object.defineProperty(this, 'Settings', {
        get: function() { return settingsCache; },  //we can also use `return name;` if we don't use `name` input param for other purposes in our code
        set: async function(value) {
            if (value.openhab_server != settingsCache.openhab_server ||
                value.openhab_item != settingsCache.openhab_item ) {
                    settingsCache = value;
                    await this.RefreshOpenhabConnection();
            }
            previousSettingsCache = settingsCache;
            this.SetSettings();
        }
        //writable: false, //if we need it to be read-only
        //... other configs
    });

    Object.defineProperty(this, 'ItemState', {
        get: function() { return _currentItemState; }
    })

    if (!OpenhabConnector.CheckServerIsRegestrated(settingsCache.openhab_server)) {
        return;
    }
    else {
        this.RefreshOpenhabConnection();
    }
}

