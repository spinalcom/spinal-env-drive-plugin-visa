/**
* SpinalDrive_App_FileExplorer_visa
* @extends {SpinalDrive_App}
*/


class SpinalDrive_App_FileExplorer_visa extends SpinalDrive_App  {
    /**
   * Creates an instance of SpinalDrive_App_FileExplorer_visa.
   * @memberof SpinalDrive_App_FileExplorer_visa
   */

    constructor() {
        super("AddItemExplorerVisa","Visa..","edit","Add to a Visa");  
    }

    /**
   * method to handle the selection
   * 
   * @param {any} element 
   * @memberof SpinalDrive_App_FileExplorer_visa
   */

   

   action(obj) {
    let _self = this;
       
    let $mdDialog =  obj.scope.injector.get('$mdDialog');
    let $templateCache = obj.scope.injector.get('$templateCache');
    let visaManagerService = obj.scope.injector.get('visaManagerService');

    $mdDialog.show({

        controller : ["$scope","$mdDialog","visaManagerService",($scope,$mdDialog,visaManagerService) => {

            visaManagerService.init()
            .then((data) => {
                $scope.allVisa = data;
            })

            $scope.visaSelected;
            $scope.message;

            

            $scope.cancel = function() {
                $mdDialog.cancel();
            }

            $scope.answer = function() {
                $mdDialog.hide({stateId : parseInt($scope.visaSelected) , itemId : obj.file._server_id, message : $scope.message});
            }


        }],
        template : $templateCache.get('addItemTemplate.html'),
        parent : angular.element(document.body),
        targetEvent : obj.evt,
        clickOutsideToClose : true
      }).then((result) => {
        visaManagerService.addItemToValidate(result);

      },() => {
          console.log("error");
      })   
   }


   
}