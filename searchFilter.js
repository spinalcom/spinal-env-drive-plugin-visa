
/****
 * 
 * Filtrer les items en faisant une recherche dans le champs de recherche
 * 
 */

angular.module('app.spinal-panel').filter('searchFilter',function() {

    return function(items,searchText) {
        var filtered = [];

        angular.forEach(items, (item) => {
            var regex = item._info.visaValidation.path.get().toUpperCase().indexOf(searchText.toUpperCase());

            if((item.name.get()).toUpperCase().indexOf(searchText.toUpperCase()) !== -1 || regex != -1) {
                filtered.push(item);
            }
        });
        
        return filtered;

    }

})