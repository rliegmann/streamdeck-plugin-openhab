class OpenHabConnector {
    openHabEventSource = null;

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

    emit(name, data) {
        if (!this._events[name]) {
          throw new Error(`Can't emit an event. Event "${name}" doesn't exits.`);
        }
    
        const fireCallbacks = (callback) => {
            var obj = JSON.parse(data);
          callback(this.context, obj);
        };
    
        this._events[name].forEach(fireCallbacks);
    }
     
    cakeRecipe() {
       return baseUrl;
    }   

    Server() {
        return this.server;
    }

    GetAvailableItems(itemType) {
        return new Promise((resolve, reject) => {
            let image;  
            fetch(this.baseUrl + "items?type="+itemType+"&recursive=false")
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

        this.itemState = movies.state;
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

    SendCommandToItem(item) {
        return new Promise((resolve, reject) => {
            fetch(this.baseUrl + "items/" + item, {
                method: 'post',                
                body: "OFF"
            })
            .then(function(response) {
                console.log(response);
            })
        })

    }

};

async function getUserAsync(name) 
{
  let response = await fetch(`https://api.github.com/users/${name}`);
  let data = await response.json()
  return data;
}

