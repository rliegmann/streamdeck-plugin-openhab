function PI_Button(inContext, inLanguage) {

    const Comand_Types = {
        NONE: "None",
        COMMAND_SEND: "SendCommand",
        COMMAND_TOGGLE: "ToggleBetweenCommand",
        COMMAND_LONG_SHORT: "LongShortCommand",        
        //...
    }

    // Init ScenePI
    var instance = this;

    var master = MasterPI.call(this, inContext, inLanguage);

    var piContent = document.getElementById('content');

    var newContent = "<div class='sdpi-item'> \
                        <div class='sdpi-item-label'>Funktion</div> \
                        <select class='sdpi-item-value select' id='select_function'> \
                            <option selected='selected' value='1'>Sende Befehl</option> \
                            <option value='2'>Wechseln zwischen Befehlen</option> \
                            <option value='3'>kurzer bzw. langer Druck</option> \
                        </select> \
                    </div> \
                    <div id='div_commandContent'> \
                    </div>";

    piContent.innerHTML = newContent;

    handleFunctionType();


    document.getElementById('select_function').addEventListener('change', functionChanged);
    document.getElementById('input_command_1').addEventListener('change', handleCommandValues);

    function functionChanged(inEvent) {
        console.log("Event");
        handleFunctionType();
    }

    function getCurrentSelectedType() {
        var functionSelect = document.getElementById('select_function');        

        switch (functionSelect.options[functionSelect.selectedIndex].value) {
            case "1":
                return Comand_Types.COMMAND_SEND;
                break;
            case "2":
                return Comand_Types.COMMAND_TOGGLE;
                break;
            case "3":
                return Comand_Types.COMMAND_LONG_SHORT;        
            default:
                return Comand_Types.NONE;
                break;
        }

        
    }

    function handleFunctionType() {    
        var comandContent = document.getElementById('div_commandContent');

        switch (getCurrentSelectedType()) {
            case Comand_Types.COMMAND_SEND:
                var newData = "<div class='sdpi-item'> \
                                    <div class='sdpi-item-label'>Befehl</div> \
                                    <input class='sdpi-item-value' id='input_command_1' placeholder='Value'> \
                                <div>";
                comandContent.innerHTML = newData;
                break;
            case Comand_Types.COMMAND_TOGGLE:
                var newData = "<div class='sdpi-item'> \
                                    <div class='sdpi-item-label'>Befehl 1</div> \
                                    <input class='sdpi-item-value' id='input_command_1' placeholder='Value 1' > \
                                </div> \
                                <div class='sdpi-item'> \
                                    <div class='sdpi-item-label'>Befehl 2</div> \
                                    <input class='sdpi-item-value' id='input_command_2' placeholder='Value 2' > \
                                </div> ";
                comandContent.innerHTML = newData;                
                break;
            case Comand_Types.COMMAND_LONG_SHORT:
                var newData = "<div class='sdpi-item'> \
                                    <div class='sdpi-item-label'>short Press</div> \
                                    <input class='sdpi-item-value' id='input_command_1' placeholder='Value 1' > \
                                </div> \
                                <div class='sdpi-item'> \
                                    <div class='sdpi-item-label'>long Press</div> \
                                    <input class='sdpi-item-value' id='input_command_2' placeholder='Value 2' > \
                                </div> ";
                comandContent.innerHTML = newData;  
            default:
                break;
        }       
        
    }

    function handleCommandValues() {  
       processConfigValues();
    }

    function processConfigValues() {
        var config = {};

        var function_select = document.getElementById('select_function');
        var value1 = document.getElementById('input_command_1');   

        config.function = function_select.options[function_select.selectedIndex].value;
        config.value1 = value1.value;

        var value2 = document.getElementById('input_command_2');  
        if ( value2 != null) {
            config.value2 = value2;
        }

        instance.setSettings("ABC");
        
    }

}