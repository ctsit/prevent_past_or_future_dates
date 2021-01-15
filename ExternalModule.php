<?php

namespace PastFutureDateTags\ExternalModule;

use ExternalModules\AbstractExternalModule;

abstract class Page
{
    const DATA_ENTRY = 'DataEntry/index.php';
    const ONLINE_DESIGNER = 'Design/online_designer.php';
    const SURVEY = 'surveys/index.php';
    const SURVEY_THEME = 'Surveys/theme_view.php';
}

abstract class ResourceType
{
    const CSS = 'css';
    const HTML = 'html';
    const JS = 'js';
}

abstract class Validate
{
    static $date_validations = [
        'date_dmy',
        'date_mdy',
        'date_ymd',
        'datetime_dmy',
        'datetime_mdy',
        'datetime_ymd',
        'datetime_seconds_dmy',
        'datetime_seconds_mdy',
        'datetime_seconds_ymd',
    ];

    // TODO: Pass in global variables and provide init function
    static function hasProjectID(): bool
    {
        return isset($project_id);
    }

    // TODO: Pass in global variables and provide init function
    static function hasRecordID(): bool
    {
        return isset($_GET['id']);
    }

    static function pageIs(string $page): bool
    {
        return PAGE == $page;
    }

    static function pageIsIn(array $pages): bool
    {
        return in_array(PAGE, $pages);
    }
}

class ExternalModule extends AbstractExternalModule
{
    public $futureDateTag = "@PREVENT-FUTUREDATE";
    public $markerElement = "@PREFILL";
    public $pastDateTag = "@PREVENT-PASTDATE";

    function containsFutureDateTag(?string $tags): bool
    {
        return (isset($tags)) ? in_array($this->futureDateTag, explode(' ', $tags)) : false;
    }

    function containsPastDateTag(?string $tags): bool
    {
        return (isset($tags)) ? in_array($this->pastDateTag, explode(' ', $tags)) : false;
    }

    // Given $Proj->metadata[$field_name] return whether the field 
    // is a text field and has date validation applied
    function isDateTypeField(array $field): bool
    {
        $isTextField = $field['element_type'] == 'text';
        $hasDateValidation = in_array($field['element_validation_type'], Validate::$date_validations);
        return $isTextField && $hasDateValidation;
    }

    function includeSource(string $resourceType, string $path)
    {
        switch ($resourceType) {
            case ResourceType::CSS:
                echo '<link href="' . $this->getUrl($path) . '" rel="stylesheet">';
                break;
            case ResourceType::HTML:
                include($path);
                break;
            case ResourceType::JS:
                echo '<script src="' . $this->getUrl($path) . '"></script>';
                break;
            default:
                break;
        }
    }

    /*
     * Note: min and max validations set on the field do not prevent entering past or future dates.
     * $element_validation_min = $field['element_validation_min'];
     * $element_validation_max = $field['element_validation_max'];
    **/
    function redcap_every_page_top($project_id)
    {
        if (Validate::pageIs(Page::ONLINE_DESIGNER) && $project_id) {
            $this->initializeJavascriptModuleObject();
            $this->tt_addToJavascriptModuleObject('futureDateTag', $this->futureDateTag);
            $this->tt_addToJavascriptModuleObject('pastDateTag', $this->pastDateTag);
            $this->tt_addToJavascriptModuleObject('markerElement', $this->markerElement);
            $this->includeSource(ResourceType::JS, 'js/helper.js');
        } else if (Validate::pageIsIn(array(Page::DATA_ENTRY, Page::SURVEY, Page::SURVEY_THEME)) && isset($_GET['id'])) {
            global $Proj;
            $instrument = $_GET['page'];
            $preventFutureDateFields = [];
            $preventPastDateFields = [];

            // Iterate through all fields and search for date fields with @PREVENT-FUTUREDATE or @PREVENT-PASTDATE
            // and add them to an array to pass to JS to apply date restrictions
            foreach (array_keys($Proj->forms[$instrument]['fields']) as $field_name) {
                $field = $Proj->metadata[$field_name];
                if ($this->isDateTypeField($field)) {
                    $action_tags = $field['misc'];

                    if ($this->containsFutureDateTag($action_tags)) {
                        array_push($preventFutureDateFields, $field_name);
                    }

                    if ($this->containsPastDateTag($action_tags)) {
                        array_push($preventPastDateFields, $field_name);
                    }
                }
            }

            $this->initializeJavascriptModuleObject();
            $this->tt_addToJavascriptModuleObject('preventFutureDateFields', json_encode($preventFutureDateFields));
            $this->tt_addToJavascriptModuleObject('preventPastDateFields', json_encode($preventPastDateFields));
            $this->includeSource(ResourceType::JS, 'js/pastFutureDateTags.js');
        }
    }
}
