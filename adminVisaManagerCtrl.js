(function(){
    angular.module('app.spinal-panel')
    .controller('adminVisaManagerCtrl',['$scope',"visaManagerService","$mdDialog","$templateCache","$rootScope","$compile",function($scope,visaManagerService,$mdDialog,$templateCache,$rootScope,$compile){


        let init = visaManagerService.init()
        $scope.allItems = [];
        init.then(() => {
            visaManagerService.getAllItemInvalidation()
            .then((el) => {

                Promise.all(el)
                .then(function(values) {
                    for (var i = 0; i < values.length; i++) {
                        if(values[i].length > 0) {
                           var x = values[i];
                           for (let index = 0; index < x.length; index++) {
                               $scope.allItems.push(x[index]);
                               $scope.$apply();
                           }
                        }
                    }
                    
                },(err) => {
                    console.log(err)
                })

            })

        })

        $scope.checkCase = (id,listValidation) => {
            let mod = FileSystem._objects[id];
          
            if(mod) {
                mod.valid.set(!mod.valid.get());
                $scope.checkValidation(listValidation);
            }

        }

        $scope.checkValidation = (listValidation) => {
            for (var i = 0; i < listValidation.validation.length; i++) {
              if(!listValidation.validation[i].valid.get()) {
                listValidation.isValid.set(false);
                return;
              }
            }
  
            listValidation.isValid.set(true);
  
        }
                
        


    }])
})();