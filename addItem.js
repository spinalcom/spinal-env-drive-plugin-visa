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

            $scope.message = "no Message !";
            $scope.visa = -1;
            $scope.nbrSelect = 0;
            $scope.formValid = false;

            

            $scope.subVisaChanged = function(value,order) {
                var parent = document.getElementsByClassName("displaySelect")[0];
                var content = angular.element(parent);
                $scope.visa = parseInt(value);

                if(order < $scope.nbrSelect) {
                    for (var i = order; i < $scope.nbrSelect; i++) {
                        var doc = document.getElementById("select_" + i);
                        doc.parentNode.removeChild(doc);
                    }
                    $scope.nbrSelect = order;
                }       
                
                $scope.addSelect(content,parseInt(value),order);
                
            }
            

            $scope.addSelect = (parent,visaSelected,order) => {
                
                var subVisa = FileSystem._objects[visaSelected]._info.subvisaPlugin;

                if(subVisa) {
                    $scope.nbrSelect += 1;
                    $scope.formValid = false;

                    FileSystem._objects[visaSelected].load((data) => {

                        var html = `
                        <md-input-container id="select_${order}" class="input_header md-block" flex-gt-sm>
                            <label>Name</label>
                            <md-select required ng-model="x_${order}" ng-change="subVisaChanged(this.x_${order},${order + 1})">`;

                        for (var i = 0; i < data.length; i++) {
                            html += `<md-option value="${data[i]._server_id}">
                                        ${data[i].name.get()}
                                    </md-option>`
                        }


                        html +=`</md-select>
                            </md-input-container>`;

                    
                        var _content = angular.element(html);
                        parent.append(_content);
                
                        $compile(_content)($scope);


                    })
               
                } else {
                    $scope.formValid = true;
                }
            }


            $scope.selectedChange = (visaSelected) => {
                var parent = document.getElementsByClassName("displaySelect")[0];
                parent.innerHTML = "";

                var content = angular.element(parent);
                $compile(content)($scope);

                $scope.addSelect(content,visaSelected,0);

            }


            $scope.cancel = function() {
                $mdDialog.cancel();
            }

            $scope.answer = function() {
                var result = {stateId : $scope.visa, message : $scope.message, itemId : obj.file._server_id}
                $mdDialog.hide(result);
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