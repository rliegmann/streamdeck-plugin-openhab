function isUUID ( uuid ) {
    let s = "" + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
      return false;
    }
    return true;
}

const AUTHENTICATION_MODE = { 
    NONE: 'NONE',
    USERNAME_PASSWORD: "USERNAME_PASSWORD",
    TOKEN: 'TOKEN'
}



window.onload = function(data) {
    var serverUUID = null;
    var dataToSend = null;
    var authenticationMode = AUTHENTICATION_MODE.NONE;;
    console.log(data);
    document.getElementById('button_check').addEventListener('click', check);
    document.getElementById('button_add').addEventListener('click', add);
    document.getElementById('button_abord'). addEventListener('click', aboard)

    document.getElementById('select_authMode').addEventListener("change", authModeChange);

    function check() {
        var protocol = document.getElementById('select_protocoll');
        var url = document.getElementById('input_url');

        var queryURL = protocol.value + "://" + url.value + "/rest/uuid";
        var options = "";

        switch (authenticationMode) {
            case AUTHENTICATION_MODE.NONE:
                options = {

                }
                break;
        
            case AUTHENTICATION_MODE.USERNAME_PASSWORD:
                var user = document.getElementById('uname').value;
                var pass = document.getElementById('psw').value;
                options = {
                    headers: {
                        'Authorization': `Basic ${btoa(`${user}:${pass}`)}`,
                    },                   
                }
            break;

            case AUTHENTICATION_MODE.TOKEN:
                var token = document.getElementById('token').value;
                options = {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
                break;
            default:
                break;
        }        

        fetch(queryURL, options).then((response) => {
        if (response.ok) {
            return response.text();
            }
            throw new Error('Something went wrong');
        })
        .then(data => {
            console.log(data)
            console.log("Is UUID: " + isUUID(data));
            if (isUUID(data)) {
                serverUUID = data;
                checkOK();
                //checkOK();
            }
            
        })
        .catch((error) => {
            checkFail(error.message);
            protocol.disabled = false;
            url.disabled = false;
        });

    }

    function checkOK() {
        var span = document.getElementById('span_checkOK');
        span.style.color = "#90FF33"; //GREEN
        span.innerHTML = "OK";

        var button = document.getElementById('button_add');
        button.disabled = false;

        var name = document.getElementById('input_name').value;
        var prot = document.getElementById('select_protocoll').value;
        var url = document.getElementById('input_url').value;
        
        var authentication = {};

        switch (authenticationMode) {
            case AUTHENTICATION_MODE.NONE:
                authentication = {
                    mode: 'none'
                }
                break;
            case AUTHENTICATION_MODE.USERNAME_PASSWORD:
                var user = document.getElementById('uname').value;
                var pass = document.getElementById('psw').value;
                authentication = {
                    mode: 'basic',
                    username: user,
                    pass: pass
                }
                break;
            case AUTHENTICATION_MODE.TOKEN:
                var token = document.getElementById('token').value;
                authentication = {
                    mode: 'token',
                    token: token
                }
                break;        
            default:
                break;
        }

        dataToSend = {
            detail: {
                name: name,
                uuid: serverUUID,
                protocoll: prot,
                url: url,
                auth: authentication
            }
        };    

       // add(dataToSend)
        /*
        window.opener.postMessage(
            {
                name: name,
                uuid: serverUUID,
                protocoll: prot,
                url: url
            });
        */
        //window.close();
    }

    function checkFail(error) {
        var span = document.getElementById('span_checkOK');
        //span.css("color", "red");
        span.style.color = "#ff0000"; //RED
        span.innerHTML = "FAIL: " + error;

        var button = document.getElementById('button_add');
        button.disabled = true;
    }

    function add() {
        var event = new CustomEvent("saveOpenHabServer", dataToSend);
        window.opener.document.dispatchEvent(event);
        window.open('','_self').close();
    }

    function aboard() {
        window.open('','_self').close();
    }

    function authModeChange() {
        var selected_Mode = document.getElementById('select_authMode').value;
        console.log(selected_Mode);

        var contentTemplate = document.getElementById('authentication_conntent');

        switch (selected_Mode) {
            case "none":
                contentTemplate.innerHTML = "";
                authenticationMode = AUTHENTICATION_MODE.NONE;
                break;
            case "username":                                    
                 contentTemplate.innerHTML = '<div class="container">\
                                                <label for="uname"><b>Username</b></label>\
                                                <input type="text" placeholder="Enter Username" id="uname" required >\
                                                <br>\
                                                <label for="psw"><b>Password </b></label>\
                                                <input type="password" placeholder="Enter Password" id="psw" required  >\
                                            </div>';
                authenticationMode = AUTHENTICATION_MODE.USERNAME_PASSWORD;

                break;
            case "token":
                contentTemplate.innerHTML = '<label for="uname"><b>Token</b></label>\
                                                <input type="text" placeholder="Token" id="token" required >';
                authenticationMode = AUTHENTICATION_MODE.TOKEN;
                                            
                break
            default:
                break;
        }
    }
}