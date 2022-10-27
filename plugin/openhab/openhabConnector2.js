class OpenHabServer {
    itemsToListen = [];
    openHabEventSource = null;

    constructor(uuid, protocol, url, name) {
        this.uuid = uuid;
        this.protocol = protocol;
        this.url = url;
        this.name = name;

        this._events = {};
    }

    _baseURL() {
        return this.protocol + "://" + this.url + "/rest/";
    }

    RegisterItemToSubscribe(item) {
        /*
        if (this.itemsToListen.includes(item)) {
            return;
        }
        */

        this.itemsToListen.push(item);

        this._refreshEventSubscriber();
    }

    DeregisterItemToSubscribe(item) {
        if (this.itemsToListen.includes(item)) {
            var index = this.itemsToListen.indexOf(item);
            if (index > -1) {
                this.itemsToListen.splice(index, 1);
            }
        }

        this._refreshEventSubscriber();
    }

    _refreshEventSubscriber() {
        if (this.openHabEventSource != null) {
            this.openHabEventSource.close();
        }

        if ( this.itemsToListen.length == 0) {
            return;
        }

        var self = this;
        var queryURL = this._baseURL() + 'events?topics=';

        this.itemsToListen.forEach((element) => {
            queryURL = queryURL + 'openhab/items/' + element + '/statechanged,';
        });

        console.log(queryURL);
        

        this.openHabEventSource = new EventSource(queryURL, { ithCredentials: false });
        this.openHabEventSource.addEventListener('message', function(e, uuid) {
            //console.log(e.data);
            self.emit('ItemStatusChanged', new OpenHabItemChangedEvent(self.uuid, e.data));
        }, false);
    }

    GetAvailableItems(uuid, itemType = ITEM_TYPE) {
        var queryURL = this._baseURL() + "items?";

        switch (itemType) {
            case ITEM_TYPE.NONE:
                break;
            case ITEM_TYPE.SWITCH:
                queryURL = queryURL + "type=" + itemType
                break;
        
            default:
                break;
        }

        queryURL = queryURL + "&recursive=false";

        return new Promise((resolove, reject) => {
            fetch(queryURL)
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

    RegisterServer(uuid, proticol, url, name) {

        if ((uuid in this._serverList)) {
            console.log("Server allready registred");
            return;
        }

        var self = this;

        var server = new OpenHabServer(uuid, proticol, url, name);
        /*
        server.on('ItemStatusChanged', function (data)  {

            console.log("NEW ITEM CHANGED FROM: " + data.uuid);        
            self.emit(data.uuid + "_ItemChanged", data.payload);

        }, false);
        */
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


//var client = new OpenHabConnector2();
//client.RegisterServer("http://openhab:8080");

/*
var payload = {};
payload.data = [];

client.GetAvailableItems(ITEM_TYPE.SWITCH)
        .then((data) => {
            data.forEach(function(entry) {
                payload["data"].push( {name: entry["name"] } );
            })
            console.log(payload);
        })
        .catch((error) => {
            payload["data"].push( {error: error.message } );
			payload.failed = true;console.log(payload);
        }); 
*/

/*
(async () => {
    const data = await client.GetCurrentStatus("SchlafzimmerLight_SchlafzimmerLampe");
    console.log(data);

    client.SendCommandToItem("SchlafzimmerLight_SchlafzimmerLampe", "ON");

    client.RegisterItemToSubscribe("HMSchreibtischHMPB2WM552OEQ0902101_1_PressShort");
    client.RegisterItemToSubscribe("HMSchreibtischHMPB2WM552OEQ0902101_2_PressShort");


    //client.DeregisterItemToSubscribe("HMSchreibtischHMPB2WM552OEQ0902101_1_PressShort");

   client.on('ItemStatusChanged', function(data)  {
    console.log(data);
   });

})();
*/


