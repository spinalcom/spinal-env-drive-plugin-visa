
angular.module('app.spinal-panel').filter('displayFilter',function() {
    return function(items,displayValue) {
        var displayed = [];

        angular.forEach(items, (item) => {
            if (displayValue == "notValid" && item._info.visaValidation.isValid < 100) {
                displayed.push(item);
            } else if(displayValue == "valid" && item._info.visaValidation.isValid == 100) {
                displayed.push(item);
            } else if (displayValue == "all") {
                displayed = items;
            }
        });

        return displayed;

    }
})