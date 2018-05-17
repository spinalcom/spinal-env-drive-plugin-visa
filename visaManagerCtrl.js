
(function(){
    angular.module('app.spinal-panel')
    .controller('visaManagerCtrl',['$scope',"visaManagerService","$mdDialog","$templateCache",function($scope,visaManagerService,$mdDialog,$templateCache){

        let init = visaManagerService.init()

        init.then(() => {
          visaManagerService.allVisa.bind(() => {
            $scope.allVisa = visaManagerService.allVisa;
            $scope.$apply();
          })
        })


        $scope.visa_server_id = -1;
        $scope.visaSelected;
        $scope.visaSelectedContent;


        $scope.addVisaStateValidation = (evt) => {
          $mdDialog.show({

            controller : ["$scope","$mdDialog","visaManagerService",($scope,$mdDialog,visaManagerService) => {
    
                $scope.name = "";
                $scope.visaStates = [];
                $scope.stateName;
                


                $scope.addState = () => {
                  if($scope.stateName && $scope.stateName.trim().length > 0)
                    $scope.visaStates.push($scope.stateName);
                  $scope.stateName = "";
                }

                $scope.cancel = function() {
                    $mdDialog.cancel();
                }
    
                $scope.answer = function() {
                    if( $scope.name.trim().length > 0 && $scope.visaStates.length > 0) {
                      $mdDialog.hide({name : $scope.name, visaStates : $scope.visaStates});
                    }
                }
    
    
            }],
            template : $templateCache.get('addStateTemplate.html'),
            parent : angular.element(document.body),
            targetEvent : evt,
            clickOutsideToClose : true
          }).then((result) => {
            visaManagerService.addVisaState(result.name,result.visaStates);
    
          },() => {
              console.log("error");
          })
        }


        $scope.selecteChange = () => {
          $scope.visaSelected = FileSystem._objects[$scope.visa_server_id];

          if($scope.visaSelected) {
            $scope.visaSelected.load((element) => {
              $scope.visaSelectedContent = element;
            })
          }

        }

        $scope.checkCase = (id,el) => {
          FileSystem._objects[id].valid = el.valid;
          


        }


    }])
})();