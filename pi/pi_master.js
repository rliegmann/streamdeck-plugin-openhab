function MasterPI (inContext, inLanguage) {
    console.log("Hello Master PI");

    // Init PI
    var instance = this;

    // Add event listener
    document.getElementById('openhab_server').addEventListener('change', serverChanged);
    document.getElementById('openhab_item').addEventListener('change', itemChanged);
    document.getElementById('openhab_item_refresh').addEventListener('click', refresh);

    function serverChanged(inEvent) {
        instance.setSettings();
        instance.getAvailableItems();
    }

    function itemChanged(inEvent) {
        instance.setSettings();
    }

    function refresh(inEvent) {
        instance.getAvailableItems();
    }

    function getCurrentAction() {
        var action

        if (instance instanceof PI_Lable) {
            action = "com.temp.openhab.lable";
        }

        return action;
    }

    this.setSettings = function () {
        var newSettings = {};

        var itemSelect = document.getElementById('openhab_item');

        newSettings.openhab_server = document.getElementById('openhab_server').value;
        newSettings.openhab_item = itemSelect.options[itemSelect.selectedIndex].value;

        SendSettings(getCurrentAction(), inContext, newSettings);
    }

    this.getAvailableItems = function () {
        GetAvailableItems(getCurrentAction(), inContext);
    }

    this.handleSendToPropertyInspector = function (payload) {
        console.log("Handle incomming Message ");
        console.log(payload);

        switch (payload.type) {
            case "getAvailableItemsResponse":
                setAvailableItems(payload);
                break;
            case "requestSettingsResponse":
                setRequestetSettings(payload.data);
                break;
            
            default:
                break;
        }
    }

    function setAvailableItems(data) {
        console.log("getAvailableItemsResponse:   " + JSON.stringify(data.data));

        var select = document.getElementById('openhab_item');
        removeOptions(select);

        var opt = document.createElement('option');
        opt.value = "---";
        opt.innerHTML = "---";
        select.appendChild(opt);

        if(data.failed) {
            var opt = document.createElement('option');
            opt.value = "error";
            opt.innerHTML = data[0].error;
            select.appendChild(opt);
            select.disabled = true;
            OpenhabItemHelper = true;
            return;
        }

        var openhab_items = data.data;                      
        openhab_items.forEach(function(entry) {
            //console.log(entry);
            var opt = document.createElement('option');
            opt.value = entry["name"];
            opt.innerHTML = entry["name"];
            select.appendChild(opt);
        })
        select.disabled = false;

        ////// REQUEST Settings
        console.log("CONTEXT: " + inContext);
        RequestSettings(getCurrentAction(), inContext);
    }

    function setRequestetSettings(data) {
        console.log("requestSettingsResponse:   " + JSON.stringify(data));
        var openhab_server = data.openhab_server;
        var openhab_item = data.openhab_item;

        document.getElementById("openhab_server").value = openhab_server;
                        
        OpenhabItemHelerLastSelect = openhab_item;
        var opt = document.getElementById('openhab_item').value=openhab_item;
        opt.selected = 'selected';
    }
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}