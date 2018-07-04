

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