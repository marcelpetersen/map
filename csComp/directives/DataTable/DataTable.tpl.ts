module DataTable { export var html = '<div>    <div style="width:100%; margin: 10px auto;">        <div style="float: left; width: 15%; margin: 0; padding: 1em">            <!-- Pull down of map layers -->            <select data-ng-model="vm.selectedLayerId"                    data-ng-change="vm.loadLayer()"                    data-ng-options="layer.id as layer.title group by layer.group for layer in vm.layerOptions"                    class="form-control tt-input"></select>            <!-- List of headers -->            <ul class="form-group" style="margin-top: 1em; margin-left: -2em; overflow-y: auto; overflow-x: hidden;"                resize resize-y="150">                <li ng-repeat="mi in vm.metaInfos" class="list-unstyled" style="white-space: nowrap; text-overflow: ellipsis">                    <label>                        <input type="checkbox" name="vm.selectedTitles[]" value="{{mi.title}}"                               data-ng-checked="vm.headers.indexOf(mi.title) > -1"                               data-ng-click="vm.toggleSelection(mi.title)">&nbsp;&nbsp;{{mi.title}}                    </label>                    <!--<div class="checkbox">                        <label>                            <input type="checkbox" name="vm.selectedTitles[]" value="{{mi.title}}"                                   data-ng-checked="vm.headers.indexOf(mi.title) > -1"                                   data-ng-click="vm.toggleSelection(mi.title)">&nbsp;&nbsp;{{mi.title}}                        </label>                    </div>-->                </li>            </ul>            <!--       <pre>{{vm.headers|json}}</pre>-->        </div>        <!-- Right side of the table view -->        <div style="margin-left: 16%; border-left: 1px solid gray; padding: 1em;" ng-init="poiTypeFilter">            <!-- Filter -->            <div class="has-feedback" style="margin-bottom: 1em; float: right; width: 16%; min-width: 200px;">                <span style="direction: ltr; position: static; display: block;">                    <input id="searchbox" data-ng-model="featureFilter" type="text"                           placeholder="Filter" autocomplete="off" spellcheck="false"                           style="position: relative; vertical-align: top;" class="form-control tt-input">                </span>                <span id="searchicon" class="fa form-control-feedback fa-filter" style="padding-top: 0px;"></span>            </div>            <!--Download to CSV option-->            <a href="" data-ng-click="vm.downloadCsv()" alt="Download CSV" style="margin-top: 5px; margin-right: 1em; float: right;"><i class="fa fa-download fa-2x"></i></a>            <!-- Specify how many items to show -->            <select data-ng-model="vm.numberOfItems" style="margin-bottom: 1em; margin-right: 10px; float: left; width: 16%; min-width: 200px;" class="form-control tt-input">                <option value="5" translate="SHOW5"></option>                <option value="10" translate="SHOW10"></option>                <option value="15" translate="SHOW15"></option>                <option value="20" translate="SHOW20"></option>                <option value="25" translate="SHOW25"></option>                <option value="30" translate="SHOW30"></option>                <option value="35" translate="SHOW35"></option>                <option value="40" translate="SHOW40"></option>            </select>            <!-- Data table -->            <table class="table table-striped table-condensed">                <tr>                    <th data-ng-repeat="header in vm.headers track by $index">                        {{header}}&nbsp;                        <a data-ng-click="reverseSort = !reverseSort; vm.orderBy($index, reverseSort);"><i data-ng-class="vm.sortOrderClass($index, reverseSort)">&nbsp;&nbsp;</i></a>                    </th>                </tr>                <tr dir-paginate="row in vm.rows | filter:featureFilter | itemsPerPage: vm.numberOfItems"                    style="cursor: pointer; vertical-align: central">                    <td data-ng-class="{\'text-right\': field.type == \'number\'}" data-ng-repeat="field in row track by $index" data-ng-bind-html="vm.toTrusted(field.displayValue)"></td>                </tr>            </table>            <dir-pagination-controls style="" max-size="10" boundary-links="true" direction-links="true"                                     template-url="bower_components/angular-utils-pagination/dirPagination.tpl.html"></dir-pagination-controls>        </div>    </div>    <div style="clear: both; margin: 0; padding: .5em"></div></div>'; }