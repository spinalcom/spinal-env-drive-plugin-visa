
angular.module('app.spinal-panel').directive("scrollBottom",function(){
    return {
        restrict : "A",
        link:function(scope,element,param) {

            element[0].on("change",function(){
                element[0].scrollTop = element[0].scrollHeight;
            })
            
        }
    }
})