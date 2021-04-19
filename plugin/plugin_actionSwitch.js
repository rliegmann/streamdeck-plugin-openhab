function ActionSwitch (inContext, inAction, inSettings, coordinates) {
    var instance = this;
    var action = inAction;

    Action.call(this, inAction, inContext, inSettings, coordinates);

    const handleOnItemStateChanged = (data) => {
        console.log('Was fired: ', data);
        
        var payload = {            
                title: data.value,
                target: STREAM_DECK_TARGET_TYPE.BOTH,               
            };
        instance.SetTitle(payload);

        if (data.value == "ON") { instance.SetState(1); }
        else if (data.value == "OFF") { instance.SetState(0);  }
    };

    instance.on("onItemStateChanged", handleOnItemStateChanged);

    
    GetAvailableItems = function() {
        instance.GetAvailableItems("switch");
    }

    this.SetNewSettings = async function(newSettings) {
        console.log("Setze neue Settings in ActionLable");
      
        if (newSettings.openhab_server != instance.Settings.openhab_server ||
            newSettings.openhab_item != instance.Settings.openhab_item) {
                //instance.SetBaseSettings(newSettings.openhab_server, newSettings.openhab_item);
                instance.Settings.openhab_server = newSettings.openhab_server;

                if(newSettings.openhab_item == "---") {
                    instance.GetAvailableItems("switch");
                }
                else {
                    instance.GetAvailableItems("switch");
                    var state = await instance.GetCurrentStatus();
                    console.log("SATAE:   " + state);
                }
        }   
        
        instance.Settings = newSettings;
         
         console.log(instance.Settings); 
    }

    this.SendSettings = function () {       
        var payload = { data: instance.Settings};				 
        payload.type = "requestSettingsResponse";

        this.SendToPI(action, payload);
    }

    this.onKeyDown = function (context) {
        console.log("FIRE KEY DOWN");
    }

    this.onKeyUp = function (context) {
        console.log("FIRE KEY UP");

        if(instance.ItemState == "ON") {
            this.SendComandToItem('switch', 'OFF');
        }
        else if (instance.ItemState == "OFF") {
            this.SendComandToItem('switch', 'ON');
        }
    }
}