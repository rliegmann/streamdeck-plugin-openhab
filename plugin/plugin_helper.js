const STREAM_DECK_TARGET_TYPE = { 
    BOTH: 0,
    HARDWARE: 1,
    SOFTWARE: 2
};

function GetCurrentAction() {
    var action

    if (this instanceof ActionLable) {
        action = "com.temp.openhab.lable";
    }

    return action;
}