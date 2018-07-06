




angular.module('app.spinal-panel').filter('itemFilter',["visaManagerService",function(visaManagerService) {
    return function(items,displayValue) {
        var displayed = [];

        angular.forEach(items, (item) => {

            var jourRestant = visaManagerService.getRemainingDay(item);
            var percentValid = item._info.visaValidation.isValid.get();

            if(displayValue == "all") {
                displayed.push(item);
            } else if(displayValue == "times" && jourRestant <= 0 && percentValid != 100) {
                displayed.push(item);
            } else if(displayValue == "exclamation" && jourRestant >= 1 && jourRestant <= 3 && percentValid != 100) {
                displayed.push(item);
            } else if(displayValue == "valid" && percentValid == 100 ) {
                displayed.push(item);
            } else if(displayValue == "warning" && jourRestant <= 7 && jourRestant > 3 && percentValid != 100) {
                displayed.push(item);
            } else if(displayValue == "cool" && jourRestant > 7 && percentValid != 100) {
                displayed.push(item);
            }       
        });

        return displayed;

    }
}])