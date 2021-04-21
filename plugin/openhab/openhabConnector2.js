class OpenHabConnector2 {
    host;
    baseUrl;

    itemsToListen = [];
    openHabEventSource = null;

    constructor () {
        this._events = {};
    }

    RegisterServer(url) {
        if (url == this.host) {
            console.log("Server allready registred");
            return;
        }

        this.host = url;
        this.baseUrl = url + "/rest/";
    }

    Close() {
        if (this.openHabEventSource != null) {
            this.openHabEventSource.close();
        }
    }

    RegisterItemToSubscribe(item) {
        if (this.itemsToListen.includes(item)) {
            return;
        }

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
            var obj = JSON.parse(data);
            var payload = JSON.parse(obj.payload);
              
            callback(payload);
        };
    
        this._events[name].forEach(fireCallbacks);
    }  

    _refreshEventSubscriber() {
        if (this.openHabEventSource != null) {
            this.openHabEventSource.close();
        }

        var self = this;
        var queryURL = this.baseUrl + 'events?topics=';

        this.itemsToListen.forEach((element) => {
            queryURL = queryURL + 'smarthome/items/' + element + '/statechanged,';
        });

        console.log(queryURL);
        

        this.openHabEventSource = new EventSource(queryURL, { ithCredentials: false });
        this.openHabEventSource.addEventListener('message', function(e) {
            //console.log(e.data);
            self.emit('ItemStatusChanged', e.data);
        }, false);
    }

    GetAvailableItems(itemType = ITEM_TYPE) {
        var queryURL = this.baseUrl + "items?";

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
        const response = await fetch(this.baseUrl + "items/" + item);
        const responseJson = await response.json();

        return responseJson;
    }

    // ToDo do nicer error handling
    SendCommandToItem(item, command) {
        new Promise((resolove, reject) => {
            fetch(this.baseUrl + 'items/' + item, {
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

    get Server() {
        return this.host;
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


