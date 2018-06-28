
angular.module('app.spinal-panel').directive("caseProgressDirective",function(){

    return {
        restrict : "A",
        link:function(scope,element,param) {

            var myPieChart = new Chart(element[0],{
                type : 'horizontalBar',
                
                data : {
                    datasets : [{
                        data : scope.getPourcentageCase(),
                        backgroundColor : scope.getBackgroundColor(),
                        label : "Stat"
                    }],
                    labels : scope.getCaseLabel()
                },
                options: {
                    scales: {
                        xAxes: [{
                            ticks : {
                                min : 0,
                                beginAtZero : true
                            },
                            barPercentage: 0
                        }]
                    }
                }
            })
        }
    }

})