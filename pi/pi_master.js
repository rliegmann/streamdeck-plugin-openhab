function MasterPI (inContext, inLanguage) {
    console.log("Hello Master PI");

    // Init PI
    var instance = this;

    // Add event listener   
    document.getElementById('openhab_item').addEventListener('change', itemChanged);
    document.getElementById('openhab_item_refresh').addEventListener('click', refresh);

    document.getElementById('button_new').addEventListener('click', pressedAddServer);
    document.getElementById('button_delete').addEventListener('click', pressedDeleteServer);
    document.getElementById('server_select').addEventListener('change', serverChanged2);

    function serverChanged(inEvent) {
        instance.setSettings();
        instance.getAvailableItems();
    }

    function serverChanged2(inEvent) {
        instance.setSettings();
        instance.getAvailableItems();
    }

    function pressedAddServer(event) {
        var popup = window.open('pi_addServer.html');
        window.addEventListener('message', (event) => {
             // Do we trust the sender of this message?  (might be
                // different from what we originally opened, for example).
                if (event.origin !== "file://")
                  return;

                console.log("Handle new Server from NewServer Page");
                if (gSettings.servers === undefined) {
                    gSettings.servers = {};
                }
                var newSettings = event.data;
                gSettings.servers[newSettings.uuid] = {
                    protocoll: newSettings.protocoll,
                    url: newSettings.url,
                    name: newSettings.name,
                }
                SetGlobalSettings(inContext);
                instance.handleGlobalSettings();

            window.removeEventListener('message', this, true);
        }, false);
    }

    function pressedDeleteServer(event) {
        gSettings.servers = {};
        SetGlobalSettings(inContext);
    }

    this.handleGlobalSettings = function() {
        var serverSelect = document.getElementById('server_select');
        removeOptions(serverSelect);

        /*
        if(gSettings.test["abc"] == "12345" ) {
            alert("OK");
        }
        */
        var opt = document.createElement('option');
        opt.value = "---";
        opt.innerHTML = "---";
        serverSelect.appendChild(opt);


        var select = document.getElementById('server_select');
        Object.keys(gSettings.servers).forEach(entry => {            
            console.log(gSettings.servers[entry]);

            var opt = document.createElement('option');
            opt.value = entry;
            opt.innerHTML = gSettings.servers[entry].name;
            serverSelect.appendChild(opt);
        })

        RequestSettings(getCurrentAction(), inContext);

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
        if (instance instanceof PI_Switch) {
            action = "com.temp.openhab.switch";
        }

        return action;
    }

    this.setSettings = function () {
        var newSettings = {};

        var itemSelect = document.getElementById('server_select');

        newSettings.openhab_server = itemSelect.options[itemSelect.selectedIndex].value;
        newSettings.openhab_item = document.getElementById('openhab_item').value;

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

        var server_opt = document.getElementById("server_select").value = openhab_server;
        server_opt.selected = 'selected';


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