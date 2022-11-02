function ActionContact (inContext, inAction, inSettings, coordinates, openhabConnector) {
    var instance = this;
    var action = inAction;

    this.GetAvailableItems = function() {
        instance.GetAvailableItems("none");
    }

    this.SetNewSettings = async function(newSettings) {
        console.log("Setze neue Settings in ActionContact");


      /*
        if (newSettings.openhab_server != instance.Settings.openhab_server ||
            newSettings.openhab_item != instance.Settings.openhab_item) {
                //instance.SetBaseSettings(newSettings.openhab_server, newSettings.openhab_item);
                instance.Settings.openhab_server = newSettings.openhab_server;

                if(newSettings.openhab_item == "---") {
                    instance.GetAvailableItems("none");
                }
                else {
                    instance.GetAvailableItems("none");
                    var state = await instance.GetCurrentStatus();
                    console.log("SATAE:   " + state);
                }
        }   
        */
        
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
    }




    Action.call(this, inAction, inContext, inSettings, coordinates, openhabConnector);  

    if (instance.Settings.openhab_item == "---") {
        console.log("BIS Hier habe ich es geschafft");      
               
    }

    const handleOnItemStateChanged = (data) => {
        console.log('Was fired: ', inContext,":   ", data); 

        var state = null;
        switch (data.value) {
            case "CLOSED":
                state = 0;
                break;
            case "OPEN":
                state = 1;  
                break;      
            default:
                state = 0;
                break;
        }
        
        data = instance.ProcessTitleTemplate(data.value);       
                
        var payload = {            
                title: data,
                target: STREAM_DECK_TARGET_TYPE.BOTH                
            };
            instance.SetTitle(payload);
            instance.SetState(state);
    
    };

    instance.on("onItemStateChanged", handleOnItemStateChanged);

    
    
}