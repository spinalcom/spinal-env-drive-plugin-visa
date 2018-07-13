
/***
 * Format la date dans l'input datepicker
 */

angular.module('app.spinal-panel').config(["$mdDateLocaleProvider",function($mdDateLocaleProvider){

    $mdDateLocaleProvider.formatDate = function(date) {
        return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    }

}])