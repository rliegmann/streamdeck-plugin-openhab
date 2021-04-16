const ITEM_TYPE = { 
    NONE: 0,
    SWITCH: 1
};

const SWITCH_STATE = {
    OFF: "OFF",
    ON: "ON"
}

class OpenHabConnectorItemChangedEvent {
    constructor (itemType = ITEM_TYPE, type, value, oldType, oldValue) {
        this.ItemType = itemType;
        this.type = type,
        this.value = value;
        this.oldType = oldType;
        this.oldValue = oldValue;
    }
}

class OpenHabConnector {
    openHabEventSource = null;
    itemType = null;

    constructor (baseUrl, context) {
        this.server = baseUrl;
        this.item = null;
        this.itemState = null;
        this.baseUrl = baseUrl + "/rest/";
        this.context = context;
       
       this._events = {};
    }

    AddItemListener(item) {
        if (this.openHabEventSource != null) {
            this.openHabEventSource.close();
        }

        this.item = item;
        this.openHabEventSource = new EventSource(this.baseUrl + "events?topics=smarthome/items/" + item + "/statechanged", { withCredentials: false } );
        console.log( this.openHabEventSource.withCredentials);
        console.log( this.openHabEventSource.readyState);
        console.log( this.openHabEventSource.url);
        var self = this;
        this.openHabEventSource.addEventListener('message', function(e) {
            self.emit("testEvent", e.data);
        }, false);

        this.openHabEventSource.onopen = function() {
            console.log("Connection to server opened.");
          };
    }

    Connect() {

    }

    Close() {
        this.openHabEventSource.close();
    }

    on(name, listener) {
        if (!this._events[name]) {
          this._events[name] = [];
        }
    
        this._events[name].push(listener);
    }

    removeListener(name, listenerToRemove) {
        if (!this._events[name]) {
          throw new Error(`Can't remove a listener. Event "${name}" doesn't exits.`);
        }
    
        const filterListeners = (listener) => listener !== listenerToRemove;
    
        this._events[name] = this._events[name].filter(filterListeners);
      }

    emit(name, data) {
        if (!this._events[name]) {
          throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
        }
    
        const fireCallbacks = (callback) => {
            var obj = JSON.parse(data);
            var payload = JSON.parse(obj.payload);
            var outData = null;
            switch (payload.type) {
                case "OnOff":
                    if(payload.value == "ON") {
                        this.itemState = SWITCH_STATE.ON;
                    } else if (payload.value == "OFF") {
                        this.itemState = SWITCH_STATE.OFF;
                    }
                    var outData = new OpenHabConnectorItemChangedEvent(ITEM_TYPE.SWITCH, payload.type, payload.value, payload.oldType, payload.oldValue);
                    break;  
                case "Decimal":
                    var outData = new OpenHabConnectorItemChangedEvent(ITEM_TYPE.NONE, payload.type, payload.value, payload.oldType, payload.oldValue);
                    break;          
                default:
                    var outData = new OpenHabConnectorItemChangedEvent(ITEM_TYPE.NONE, payload.type, payload.value, payload.oldType, payload.oldValue);
                    break;
            }
            
          callback(this.context, outData);
        };
    
        this._events[name].forEach(fireCallbacks);
    }
     
    cakeRecipe() {
       return baseUrl;
    }   

    Server() {
        return this.server;
    }

    Item() { return this.item; }

    ItemState() {       
        return this.itemState;
     }

    GetAvailableItems(itemType = ITEM_TYPE) {
        var url = this.baseUrl + "items?";
        var type = ConvertItemTypeToString(itemType);

        if (itemType == ITEM_TYPE.NONE) {
            url = url + "recursive=false";
        } else {
            url = url + "type="+type + "&recursive=false";
        }
        
        return new Promise((resolve, reject) => {
            let image;  
            fetch(url)
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                    reject(new Error(response.statusText));
                }

                resolve(response.json());
            })
            .catch((error) => {
                console.log('Error:', error);
                reject(error);
              });  
            
          })
    }

    async GetCurrentStatus(item) {
        const response = await fetch(this.baseUrl + "items/" + item)
        const movies = await response.json();
        
        if(movies.state == "ON") {
            this.itemState = SWITCH_STATE.ON;
        } else if (movies.state == "OFF") {
            this.itemState = SWITCH_STATE.OFF;
        }
        return movies;
        /*
            .then(function(response) {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('Kurse konnten nicht geladen werden');
                })        
            .catch(function(err) {
            // Hier Fehlerbehandlung
            });
            */
    }

    SendCommandToItem(command = SWITCH_STATE) {
        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + "items/" + this.item, {
                method: 'post',                
                body: command
            })
            .then(function(response) {
                console.log(response);
            })
        })

    }

};



function ConvertItemTypeToString (itemType = ITEM_TYPE) {
    switch (itemType) {
        case ITEM_TYPE.NONE:    
        	return "none";
        case ITEM_TYPE.SWITCH:
            return "Switch";                
        default:
            return "none";            ;
    }
}

async function getUserAsync(name) 
{
  let response = await fetch(`https://api.github.com/users/${name}`);
  let data = await response.json()
  return data;
}

