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
    let $compile = obj.scope.injector.get('$compile');
    let $rootScope = obj.scope.injector.get('$rootScope');

    $mdDialog.show({

        controller : ["$scope","$mdDialog","visaManagerService","$compile","$rootScope",($scope,$mdDialog,visaManagerService,$compile,$rootScope) => {

            visaManagerService.init()
            .then((data) => {
                $scope.allVisa = data;
            })

            $scope.visaSelected;
            $scope.message;

            $scope.selects = [];


            $scope.isDirectory = (element) => {
                for (var i = 0; i < element.length; i++) {
                  if(element[i]._info.model_type == "Directory") {
                    return true;
                  }
                }
                return false;
            }
    
            $scope.addContent = (parent,element) => {
                var html = `<md-input-container class="md-block" flex-gt-sm>
                <label>Name</label>
                <md-select ng-model="x" ng-change="">`;
                if($scope.isDirectory(element)) {
                  
                
                for (var i = 0; i < element.length; i++) {
                    html += `<md-option value="${element[i]._server_id}">
                                ${element[i].name}
                            </md-option>`;
                }
                    

                            
                html +=`</md-select>
                    </md-input-container>`;
                    
                    
                var _content = angular.element(html);
                parent.append(_content);
        
                $compile(_content)($rootScope);
        
                }
            }

            $scope.selectedChange = (el) => {
                var mod = FileSystem._objects[el];

                if(mod) {
                    mod.load((element) => {
                        var displaySelect = document.getElementsByClassName("displaySelect")[0];
                        var content = angular.element(displaySelect);
                    
                        $compile(content)($rootScope);

                        $scope.addContent(content,element);
                    })
                }

                // var displaySelect = document.getElementsByClassName("displaySelect")[0];
                // var content = angular.element(displaySelect);
              
                // $compile(content)($rootScope)

                // $scope.addContent(content,element);
            }


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