class OpenHabServer {
    itemsToListen = [];
    openHabEventSource = null;
    ctrl = new AbortController();
    

    constructor(uuid, protocol, url, name, auth) {
        this.uuid = uuid;
        this.protocol = protocol;
        this.url = url;
        this.name = name;
        this.auth = auth;

        this._events = {};
        this.ctrl = new AbortController();
    }

    _baseURL() {
        return this.protocol + "://" + this.url + "/rest/";
    }

    RegisterItemToSubscribe(item) {  
        this.itemsToListen.push(item);

        this._refreshEventSubscriber();
    }

    DeregisterItemToSubscribe(item) {
        if (this.itemsToListen.includes(item)) {
            var index = this.itemsToListen.indexOf(item);
            if (index > -1) {
                this.itemsToListen.splice(index, 1);
            }
            this._refreshEventSubscriber();
        }

       
    }

    DeregisterAllItemsToSubscribe() {
        this.itemsToListen = [];
        this._refreshEventSubscriber();
    }

    _refreshEventSubscriber() {

        
        if (this.openHabEventSource != null) {
           this.ctrl.abort("STOP");
           //this.openHabEventSource = null;
           this.ctrl = new AbortController();
        }

        if ( this.itemsToListen.length == 0) {
            return;
        }

        var self = this;
        var queryURL = this._baseURL() + 'events?topics=';

        this.itemsToListen.forEach((element) => {
            queryURL = queryURL + 'openhab/items/' + element + '/statechanged,';
        });

        console.log("New Query: " + queryURL);
        var options = this._buildConnectionOptions();
              
        /* Azure EventSource */

        this.openHabEventSource = new window.mEventSource.fetchEventSource(queryURL, {        
            method: 'GET',
            headers: options.headers,  
            signal: this.ctrl.signal,
            onmessage(e) {
                console.log(e.data);
                if (e.data == `{"type":"ALIVE"}`) {
                    // Do anything with the Alive Message
                    console.log("ALIVE from OpenHAB Server :-)");
                } else {
                    self.emit('ItemStatusChanged', new OpenHabItemChangedEvent(self.uuid, e.data));
                }
            },
            onerror(err) {
                console.log(err);
            }
        
            
        });
        
    } 

    _buildConnectionOptions () {
        var options = "";
        switch (this.auth.mode) {
            case 'none':   
            options = {
                headers: {
                    'Content-Type': 'text/event-stream',
                }
            };             
                break;
            case 'basic':
                options = {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Authorization': `Basic ${btoa(`${this.auth.username}:${this.auth.pass}`)}`,
                    },                   
                }
                break;
            case 'token':
                options = {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Authorization': `Bearer ${this.auth.token}`,
                    },
                }
                break;            
        }
        return options;
    }

    GetAvailableItems(uuid, itemType = ITEM_TYPE) {
        var queryURL = this._baseURL() + "items?";

        switch (itemType) {
            case ITEM_TYPE.NONE:
                break;
            case ITEM_TYPE.SWITCH:
                queryURL = queryURL + "type=" + itemType;
                break;
            case ITEM_TYPE.CONTACT:
                queryURL = queryURL + "type=" + itemType;
            default:
                break;
        }

        queryURL = queryURL + "&recursive=false";

        var options = this._buildConnectionOptions();

        return new Promise((resolove, reject) => {
            fetch(queryURL, options)
            .then(function(response) {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                    reject(new Error(response.statusText)); 
                }

                resolove(response.json());
            })
            .catch((error) => {
                console.log('Error: ' , error);
                reject(error);
            })
        })



    }

    async GetCurrentStatus(item) {   // change this to promise 
        const response = await fetch(this._baseURL() + "items/" + item);
        const responseJson = await response.json();

        return responseJson;
    }

    // ToDo do nicer error handling
    SendCommandToItem(item, command) {
        new Promise((resolove, reject) => {
            fetch(this._baseURL() + 'items/' + item, {
                method: 'post',
                body: command
            })
            .then(function(response) {
                console.log(response);
                if (response.status === 200) {
                    //OK Handle some stuff
                }
                else if (response.status === 400) {  //Item Command null
                    console.log("Command " + command + " is not valide for Item " + item);
                    reject(new Error(response.statusText));
                }
                else if (response.status === 404) {  // Item not found
                    console.log("Item " + item + " not found");
                    reject(new Error(response.statusText));
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                reject(error);
            })
        })
    } 

    // EVENTS
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
              
            callback(data);
        };
    
        this._events[name].forEach(fireCallbacks);
    }

    UpdateServerSettings() {

    }
}

class OpenHabItemChangedEvent {
    constructor(uuid, payload) {
        this.uuid = uuid;
        this.payload = payload;
    }
}

class OpenHabConnector2 {
    _serverList = [];
    
    constructor () {
        this._events = {};
    }

    RegisterServer(uuid, proticol, url, name, auth) {
        
        if ((uuid in this._serverList)) { //If the server already exists but is to be registered again, the settings have changed.
            console.log("Server allready registred. Update Settings");
            this._serverList[uuid].DeregisterAllItemsToSubscribe();     // Remove all items for listening and reset with the new settings.
        }     

        var server = new OpenHabServer(uuid, proticol, url, name, auth);        
        this._serverList[uuid] = server;
    }

    DeregisterServer(removeUUID) {
       if ( (removeUUID in this._serverList) ) {
           
           this._serverList[removeUUID].removeListener("ItemStatusChanged");
            delete this._serverList[removeUUID];
       }
    }

    Close() {
        if (this.openHabEventSource != null) {
            this.openHabEventSource.close();
        }
    }

    AddItemListener(uuid, item) {
        this._serverList[uuid].RegisterItemToSubscribe(item);
    }

    RemoveItemListener (uuid, item) {
        this._serverList[uuid].DeregisterItemToSubscribe(item);
    }    

    CheckServerIsRegestrated (uuid) {
        if (uuid in this._serverList) {
            return true;
        }
        return false;        
    }

    GetServerWithUUID(uuid) {
        return this._serverList[uuid];
    }    

    // EVENTS
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
              
            callback(data);
        };
    
        this._events[name].forEach(fireCallbacks);
    }     

    GetAvailableItems(uuid, itemType = ITEM_TYPE) {        

        return new Promise((resolove, reject) => {
            this._serverList[uuid].GetAvailableItems(itemType)
            .then((data) => {
                resolove(data);
            })
            .catch((error) => {
                console.log('Error: ' , error);
                reject(error);
            })
        })
        

    }

    async GetCurrentStatus(uuid, item) {   // change this to promise 
        console.log("TEST");
         var data =  await this._serverList[uuid].GetCurrentStatus(item);
         return data;
    }

    // ToDo do nicer error handling
    SendCommandToItem(uuid, item, command) {
        //Call the right UUID connection
        this._serverList[uuid].SendCommandToItem(item, command);
    }    

    get Servers() {
        return this._serverList;
    }

};