function PI_Button(inContext, inLanguage) {
    master = MasterPI.call(this, inContext, inLanguage);
    LoadSpecificContent("button");

   document.getElementById('specific_mode').addEventListener('change', ChangeMode);
   document.getElementById('specific_command_1').addEventListener('blur', ChangeMode);
   document.getElementById('specific_command_2').addEventListener('blur', ChangeMode);

   function ChangeMode() {
    var newSpecificSettings = {};

    var mode = document.getElementById('specific_mode').value;
    var cmd1 = document.getElementById('specific_command_1').value;
    var cmd2 = document.getElementById('specific_command_2').value;

    newSpecificSettings.mode = mode;
    newSpecificSettings.cmd1 = cmd1;
    newSpecificSettings.cmd2 = cmd2;

    master.setSettings(newSpecificSettings);
   }

   this.ShowSpecificSettings = function(data) {
    if (data.mode != undefined) { document.getElementById('specific_mode').value = data.mode; };
    if (data.cmd1 != undefined) {document.getElementById('specific_command_1').value = data.cmd1; };
    if (data.cmd2 != undefined) {document.getElementById('specific_command_2').value = data.cmd2; };
}
}