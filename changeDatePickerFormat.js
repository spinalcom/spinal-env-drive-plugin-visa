
angular.module('app.spinal-panel').config(["$mdDateLocaleProvider",function($mdDateLocaleProvider){

    $mdDateLocaleProvider.formatDate = function(date) {
        
        return date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
    }

}])