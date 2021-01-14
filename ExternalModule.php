<?php

namespace PastFutureDate\ExternalModule;

use ExternalModules\AbstractExternalModule;
use Form;

abstract class ResourceType
{
    const CSS = 'css';
    const HTML = 'html';
    const JS = 'js';
}

class ExternalModule extends AbstractExternalModule
{

    public $futureDateTag = "@PREVENTFUTURE";
    public $pastDateTag = "@PREVENTPAST";
    public $markerElement = "@PREFILL";

    function redcap_every_page_top($project_id)
    {
        $this->initializeJavascriptModuleObject();
        $this->tt_addToJavascriptModuleObject('helpUrl', json_encode($this->getUrl('documentation.php')));
        $this->tt_addToJavascriptModuleObject('futureDateTag', $this->futureDateTag);
        $this->tt_addToJavascriptModuleObject('pastDateTag', $this->pastDateTag);
        $this->tt_addToJavascriptModuleObject('markerElement', $this->markerElement);
        $this->includeSource(ResourceType::JS, 'js/helper.js');
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
}
