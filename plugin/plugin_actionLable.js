function ActionLable (inContext, inAction, inSettings, coordinates, openhabConnector) {
    var instance = this;
    var action = inAction;

    this.GetAvailableItems = function() {
        instance.GetAvailableItems("none");
    }

    this.SetNewSettings = async function(newSettings) {
        console.log("Setze neue Settings in ActionLable");


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
        console.log('Was fired: ', data); 
        
        data = instance.ProcessTitleTemplate(data.value);
                
        var payload = {            
                title: data,
                target: STREAM_DECK_TARGET_TYPE.BOTH,
                state: 0
            };
            instance.SetTitle(payload);
    
    };

    instance.on("onItemStateChanged", handleOnItemStateChanged);

    
    
}