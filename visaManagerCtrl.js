
(function(){
    angular.module('app.spinal-panel')
    .controller('visaManagerCtrl',['$scope',"visaManagerService",function($scope,visaManagerService){

        let init = visaManagerService.init()

        init.then(() => {
          visaManagerService.allVisa.bind(() => {
            console.log("element",visaManagerService.allVisa);
            $scope.allVisa = visaManagerService.allVisa;
            $scope.$apply();
          })
        })


        $scope.visa_server_id = -1;
        $scope.visaSelected;
        $scope.visaSelectedContent;

        $scope.selecteChange = () => {
          $scope.visaSelected = FileSystem._objects[$scope.visa_server_id];

          if($scope.visaSelected) {
            $scope.visaSelected.load((element) => {
              $scope.visaSelectedContent = element;
            })
          }

        }




    }])
})();