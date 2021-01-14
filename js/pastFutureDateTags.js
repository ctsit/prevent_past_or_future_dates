// https://community.projectredcap.org/questions/41383/use-datepicker-in-external-module-custom-code.html
$(window).on('load', function () {
    let module = ExternalModules['PastFutureDateTags'].ExternalModule;
    let preventFutureDateFields = JSON.parse(module.tt('preventFutureDateFields'));
    let preventPastDateFields = JSON.parse(module.tt('preventPastDateFields'));
    let attachedListeners = false;
    // console.log(module);
    // console.log(preventFutureDateFields, preventPastDateFields);

    // REDCap calls $.datepicker.setDefaults() after External Module javascript is executed.
    // Because of this the restrictions on the jQuery UI datepicker need to be applied after
    // all javascript has run.
    $('#form').on('mouseover', function() {
        if (!attachedListeners) {
            attachedListeners = true;
            applyDateRestrictions(preventFutureDateFields, preventFutureDate);
            applyDateRestrictions(preventPastDateFields, preventPastDate);
        }
    });

    function applyDateRestrictions(dateFields, fn) {
        for (const field of dateFields) {
            fn(field);
        }
    }

    // Sets the maxDate option on the jQuery UI datepicker
    function preventFutureDate(field) {
        let $input = $(`#${field}-tr input`);
        $input.datepicker("option", "maxDate", "+0d");
    }

    // Sets the minDate option on the jQuery UI datepicker
    function preventPastDate(field) {
        let $input = $(`#${field}-tr input`);
        $input.datepicker("option", "minDate", "-0d");
    }
});
	