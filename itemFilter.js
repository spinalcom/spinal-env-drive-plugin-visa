


/****
 * Filtrer les items par validation
 * 
 */

angular.module('app.spinal-panel').filter('itemFilter',["visaManagerService",function(visaManagerService) {
    return function(items,displayValue) {
        var displayed = [];

        angular.forEach(items, (item) => {

            var jourRestant = visaManagerService.getRemainingDay(item);
            var percentValid = item._info.visaValidation.isValid.get();

            if(displayValue == "all") {
                displayed.push(item);
            } else if(displayValue == "times" && visaManagerService.caseInvalid(item)) { /*** Si case Invalide */
                displayed.push(item);
            } else if(displayValue == "exclamation" && jourRestant < 0 && percentValid != 100 && !visaManagerService.caseInvalid(item)) { /*** delai ecoulé */
                displayed.push(item);
            } else if(displayValue == "valid" && percentValid == 100 ) { /*** Valide */
                displayed.push(item);
            } else if(displayValue == "warning" && jourRestant <= 5 && jourRestant >= 0 && percentValid != 100 && !visaManagerService.caseInvalid(item)) { /*** inferieur à 5 jours */
                displayed.push(item);
            } else if(displayValue == "cool" && jourRestant > 5 && percentValid != 100 && !visaManagerService.caseInvalid(item)) { /*** Superieur à une semaine */
                displayed.push(item);
            }       
        });

        return displayed;

    }
}])