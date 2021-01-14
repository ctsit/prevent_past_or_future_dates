$(document).ready(function () {
    if ($('#div_field_annotation').length === 0) {
        return;
    }

    $('body').on('dialogopen', function (event, ui) {
        let $popup = $(event.target);
        let module = ExternalModules['PastFutureDate'].ExternalModule;
        let futureDateTag = module.tt('futureDateTag');
        let pastDateTag = module.tt('pastDateTag');
        let markerElement = module.tt('markerElement');
        let helpUrl = module.tt('helpUrl');

        appendToMarkerElement($popup, markerElement, futureDateTag, helpUrl);
        appendToMarkerElement($popup, futureDateTag, pastDateTag, helpUrl);
    });

    var appendToMarkerElement = function (container, markerElement, tagName, helpUrl) {
        // Aux function that checks if text matches the "@HIDECHOICE" string.
        var isDefaultLabelColumn = function () {
            return $(this).text() === markerElement;
        }

        // Getting @PREFILL row from action tags help table.
        var $default_action_tag = container.find('td').filter(isDefaultLabelColumn).parent();
        if ($default_action_tag.length !== 1) {
            return false;
        }

        // Create the help text
        var descr = $('<div></div>')
            .addClass('pastfuturedate-container')
            .html('Prevents a radio, checkbox, or text field into a clickable image. For example, to display a male body '
                + 'with clickable body parts, you may use <nobr>@IMAGEMAP=PAINMAP_MALE</nobr>.  For a full list of available '
                + 'image maps and details about options, please reference the:<br>');
        $('<a></a>')
            .attr('href', helpUrl)
            .attr('target', '_BLANK')
            .append(
                $('<div></div>')
                    .addClass('btn btn-xs btn-primary')
                    .text('Full Documentation')
            )
            .appendTo(descr);

        // Creating a new action tag row.
        var $new_action_tag = $default_action_tag.clone();
        var $cols = $new_action_tag.children('td');
        var $button = $cols.find('button');

        // Column 1: updating button behavior.
        $button.attr('onclick', $button.attr('onclick').replace(markerElement, tagName));

        // Columns 2: updating action tag label.
        $cols.filter(isDefaultLabelColumn).text(tagName);

        // Column 3: updating action tag description.
        $cols.last().html(descr);

        // Placing new action tag.
        $new_action_tag.insertAfter($default_action_tag);
    }

});