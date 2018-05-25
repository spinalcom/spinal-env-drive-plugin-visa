(function(){
    angular.module('app.spinal-panel')
    .controller('visaManagerCtrl',['$scope',"visaManagerService","$mdDialog","$templateCache","$rootScope","$compile",function($scope,visaManagerService,$mdDialog,$templateCache,$rootScope,$compile){

        let init = visaManagerService.init()

        init.then(() => {
          visaManagerService.allVisa.bind(() => {
            $scope.allVisa = visaManagerService.allVisa;
            $scope.$apply();
          })
        })


        $scope.visa_server_id = -1;
        $scope.visaSelectedContent;
        $scope.nbrSelect = 0;
        $scope.displayTable = false;


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




        $scope.subVisaChanged = function(value,order) {
            var parent = document.getElementById("selects");
            var content = angular.element(parent);
            $scope.visa_server_id = parseInt(value);

            if(order < $scope.nbrSelect) {
                for (var i = order; i < $scope.nbrSelect; i++) {
                    var doc = document.getElementById("mySelect_" + i);
                    doc.parentNode.removeChild(doc);
                    $scope.nbrSelect -= 1;
                }
            }       
            
            $scope.addSelect(content,parseInt(value),order);
            
        }


        $scope.addSelect = (parent,visaSelected,order) => {
                
            var subVisa = FileSystem._objects[visaSelected]._info.subvisaPlugin;

            if(subVisa) {
                $scope.nbrSelect += 1;
                $scope.displayTable = false;
                FileSystem._objects[visaSelected].load((data) => {

                    var html = `
                    <md-input-container id="mySelect_${order}" class="md-block" flex-gt-sm>
                        <label>Name</label>
                        <md-select required ng-model="x_${order}" ng-change="subVisaChanged(this.x_${order},${order + 1})">`;

                    for (var i = 0; i < data.length; i++) {
                        html += `<md-option value="${data[i]._server_id}">
                                    ${data[i].name.get()}
                                </md-option>`;
                    }


                    html +=`</md-select>
                        </md-input-container>`;

                
                    var _content = angular.element(html);
                    parent.append(_content);
            
                    $compile(_content)($scope);


                })
          
            } else {
              $scope.visaFolder = FileSystem._objects[$scope.visa_server_id];
              $scope.displayTable = true;
              if($scope.visaFolder) {
                $scope.visaFolder.load((element) => {
                  $scope.visaSelectedContent = element;
                })
              }
            }
        }


        $scope.selecteChange = () => {

          var parent = document.getElementById("selects");
          parent.innerHTML = "";

          var content = angular.element(parent);
          $compile(content)($scope);

          $scope.addSelect(content,$scope.visa_server_id,0);

        }


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