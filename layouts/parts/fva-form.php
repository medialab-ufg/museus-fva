<div id="fva-survey">
    <form id="fva-form" ng-controller="rootController" data-fvaOpenYear="<?php echo (isset($fvaOpenYear)) ? $fvaOpenYear : ''; ?>">
        <div ui-view></div>
    </form>
</div>