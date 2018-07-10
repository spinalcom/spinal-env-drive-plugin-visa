
/****
 * directive pour les graph
 */

angular.module('app.spinal-panel').directive("chartDirective",function(){
    return {
        restrict : "A",
        link:function(scope,element,param) {
            var myPieChart = new Chart(element[0],{
                type : 'pie',
                data : {
                    datasets : [{
                        data : scope.ItemsValidCount(),
                        backgroundColor : ["green","red"]
                    }],
                    labels : [
                        'Valid',
                        'Not Valid'
                    ]
                }
            })
        }
    }
})