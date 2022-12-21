const ITEM_TYPE = { 
    NONE: "",
    SWITCH: "Switch",
    CONTACT: "Contact"
};

function parseOpenHabVerson(str) {
    if (typeof(str) != 'string') { return false; }
    var element = str.split('.');

    var major = parseInt(element[0]);
    var minor = parseInt(element[1]);
    var patch = parseInt(element[2]);
    var build = element[3];

    return {
        major: major,
        minor: minor,
        patch: patch,
        build: build
    }
}