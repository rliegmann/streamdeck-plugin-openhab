function isUUID ( uuid ) {
    let s = "" + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
      return false;
    }
    return true;
}



window.onload = function(data) {
    var serverUUID = null;
    console.log(data);
    document.getElementById('button_check').addEventListener('click', check);

    function check() {
        var protocol = document.getElementById('select_protocoll');
        var url = document.getElementById('input_url');

        protocol.disabled = true;
        url.disabled = true;

        var queryURL = protocol.value + "://" + url.value + "/rest/uuid";

        fetch(queryURL)
        .then((response) => response.text())
        .then(data => {
            console.log(data)
            console.log("Is UUID: " + isUUID(data));
            if (isUUID(data)) {
                serverUUID = data;
                checkOK();
            }
            
        })
        .catch((error) => {
            checkFail();
            protocol.disabled = false;
            url.disabled = false;
        });

    }


    function checkOK() {
        var span = document.getElementById('span_checkOK');
        span.innerHTML = "OK";

        var button = document.getElementById('button_add');
        button.disabled = false;

        var name = document.getElementById('input_name').value;
        var prot = document.getElementById('select_protocoll').value;
        var url = document.getElementById('input_url').value;
        
        window.opener.postMessage(
            {
                name: name,
                uuid: serverUUID,
                protocoll: prot,
                url: url
            });
        window.close();
    }

    function checkFail() {
        var span = document.getElementById('span_checkOK');
        span.innerHTML = "FAIL";

        var button = document.getElementById('button_add');
        button.disabled = true;
    }
}