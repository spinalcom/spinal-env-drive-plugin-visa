
/******
 * 
 * 
 *  Ce Fichier contient des fonctions pour ajouter un item à valider
 * 
 * 
*******/


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
        super("AddItemExplorerVisa","Add to visa validation","add to visa","playlist_add");  
    }

    /**
   * method to handle the selection
   * 
   * @param {any} element 
   * @memberof SpinalDrive_App_FileExplorer_visa
   */

   
   /***
    * 
    * La fonction action est exécutée quand on click sur le button < Add to visa validation >
    */

   action(obj) {
        let _self = this;
        let $mdDialog =  obj.scope.injector.get('$mdDialog');
        let $templateCache = obj.scope.injector.get('$templateCache');
        let visaManagerService = obj.scope.injector.get('visaManagerService');


        /* Si le fichier est déjà en cours de validation afficher une alert  */
        if(FileSystem._objects[obj.file._server_id]._info.visaValidation) {
            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.body))
                .clickOutsideToClose(true)
                .title('Sorry')
                .textContent('Sorry this file has already been sent for validation !!!')
                .ariaLabel('Alert')
                .ok('OK')
                .targetEvent(obj.evt)
            );

            return;
        }


        /* Sinon Afficher un modal pour choisir le dossier dans le quel on veut mettre le dossier */
        $mdDialog.show({

            controller : ["$scope","$mdDialog","visaManagerService","$compile","$rootScope",($scope,$mdDialog,visaManagerService,$compile,$rootScope) => {

                visaManagerService.init()
                .then((data) => {
                    $scope.allVisa = data;
                })

                $scope.message = "";
                $scope.visa = -1;
                $scope.nbrSelect = 0;
                $scope.dateToValid = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                $scope.formValid = false;

                var t = new Date();

                $scope.minDate = new Date(
                    t.getFullYear(),
                    t.getMonth(),
                    t.getDate() + 1,

                )
                

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

                    $scope.nbrSelect = 0;

                    var content = angular.element(parent);
                    $compile(content)($scope);

                    $scope.addSelect(content,visaSelected,0);

                }


                $scope.cancel = function() {
                    console.log($scope.dateToValid);
                    $mdDialog.cancel();

                }

                $scope.answer = function() {

                    

                    if($scope.message.trim().length == 0) {
                        $scope.message = "-";
                    } else {
                        $scope.message = $scope.message.trim();
                    }

                    var result = {stateId : $scope.visa, message : $scope.message, itemId : obj.file._server_id, validateBefore : new Date($scope.dateToValid).getTime()}
                    
                    result["path"] = "/" + FileSystem._objects[$scope.visaSelected].name.get();

                    for (var i = 0; i < $scope.nbrSelect; i++) {
                        result["path"] += "/" + FileSystem._objects[eval(`$scope.x_${i}`)].name.get()
                    }
                    
                    result.path += "/" + obj.file.name;

                    $mdDialog.hide(result);

                }


            }],
            template : $templateCache.get('addItemTemplate.html'),
            parent : angular.element(document.body),
            targetEvent : obj.evt,
            clickOutsideToClose : false
        }).then((result) => {

            $mdDialog.show({
                controller : ["$scope","$mdDialog","visaManagerService","$compile","$rootScope",($scope,$mdDialog,visaManagerService,$compile,$rootScope) => {


                    $scope.caseToCheck = [];

                    visaManagerService.getAllCase().then((el) => {
                        var myCases = el._info.listCaseValidation.get();

                        for (var i = 0; i < myCases.length; i++) {
                            myCases[i]["checked"] = true;
                            $scope.caseToCheck.push(myCases[i]);
                        }

                    },() => {
                        console.log("error")
                    })


                    $scope.cancel = () => {
                        $mdDialog.cancel();
                    }

                    $scope.answer = () => {
                        var res = {data : result, caseToCheck : $scope.caseToCheck};
                        $mdDialog.hide(res);
                    }

                }],
                template : $templateCache.get('selectCaseTemplate.html'),
                parent : angular.element(document.body),
                targetEvent : obj.evt,
                clickOutsideToClose : false
            }).then((result) => {

                var it = FileSystem._objects[result.data.itemId];
               
                if(it._info.model_type.get().toLowerCase() == "directory") {
                    visaManagerService.addFolderToValidate(result.data,result.data.path,result.caseToCheck);
                } else {
                    visaManagerService.addItemToValidate(result.data,result.data.path,result.caseToCheck);
                }

            },() => {
                console.log("canceled")
            })

            /*
            // Appel à la fonction addItemToValidate du factory
            visaManagerService.addItemToValidate(result,result.path);
            */

        },() => {
            console.log("error");
        })
        
        
        

    }

}