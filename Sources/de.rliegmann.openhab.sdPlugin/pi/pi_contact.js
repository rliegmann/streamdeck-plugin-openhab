function PI_Contact(inContext, inLanguage) {
    master = MasterPI.call(this, inContext, inLanguage);
    LoadSpecificContent("contact");

    document.getElementById('specific_alternative_closed').addEventListener('blur', ChangeAlternativValues);
    document.getElementById('specific_alternative_open').addEventListener('blur', ChangeAlternativValues);

    function ChangeAlternativValues() {
        var newSpecificSettings = {};

        var closeValue = document.getElementById('specific_alternative_closed').value;
        var openValue = document.getElementById('specific_alternative_open').value;

        if (closeValue != "") {
            newSpecificSettings.closeValue = closeValue;
        }

        if (openValue != "") {
            newSpecificSettings.openValue = openValue;
        }

        master.setSettings(newSpecificSettings);

    }

    this.ShowSpecificSettings = function(data) {
        if (data.closeValue != undefined) { document.getElementById('specific_alternative_closed').value = data.closeValue; };
        if (data.openValue != undefined) {document.getElementById('specific_alternative_open').value = data.openValue; };
    }
}