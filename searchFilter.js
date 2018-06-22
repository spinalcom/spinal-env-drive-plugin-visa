

angular.module('app.spinal-panel').filter('searchFilter',function() {

    return function(items,searchText) {
        var filtered = [];

        angular.forEach(items, (item) => {
            if((item.name.get()).toUpperCase().indexOf(searchText.toUpperCase()) !== -1) {
                filtered.push(item);
            }
        });
        
        return filtered;

    }

})