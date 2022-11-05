function ActionButton (inContext, inAction, inSettings, coordinates, openhabConnector) {
    var instance = this;
    var action = inAction;    

    var mode = "once";
    var cmd1 = undefined;
    var cmd2 = undefined;

    this.GetAvailableItems = function() {
        instance.GetAvailableItems("none");
    }

    this.SetNewSettings = async function(newSettings) {
        console.log("Setze neue Settings in ActionContact");     
        
        processCommands(newSettings);

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

    function processCommands(newSettings) {
        if (newSettings.specificSettings != undefined) {
            mode = newSettings.specificSettings.mode;
            cmd1 = newSettings.specificSettings.cmd1;
            cmd2 = newSettings.specificSettings.cmd2;
        }

    }

    this.SendSettings = function () {       
        var payload = { data: instance.Settings};				 
        payload.type = "requestSettingsResponse";

        this.SendToPI(action, payload);
    }

    this.onKeyDown = function (context) {
        console.log("FIRE KEY DOWN");
        instance.SendComandToItem("string", cmd1);
    }

    this.onKeyUp = function (context) {
        console.log("FIRE KEY UP");
        if (mode == "updown") {
            instance.SendComandToItem("string", cmd2);
        }
    }




    Action.call(this, inAction, inContext, inSettings, coordinates, openhabConnector);  

    if (instance.Settings.openhab_item == "---") {
        console.log("BIS Hier habe ich es geschafft");      
               
    }  
    
    processCommands(inSettings);

    const handleOnItemStateChanged = (data) => {
        console.log('Was fired: ', inContext,":   ", data); 
        
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