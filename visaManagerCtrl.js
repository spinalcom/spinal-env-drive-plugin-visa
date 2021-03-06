(function(){
    angular.module('app.spinal-panel')
    .controller('visaManagerCtrl',['spinalFileSystem','$scope',"visaManagerService","$mdDialog","$templateCache","$rootScope","$compile",function(spinalFileSystem,$scope,visaManagerService,$mdDialog,$templateCache,$rootScope,$compile){


        let init = visaManagerService.init()
        $scope.allItems = [];
        $scope.searchText = "";
        $scope.itemValid = "all";

      /****
     * 
     * Initialisation pour recuperer tous les fichiersauthService
     * et créer le dossier __visa__
     * 
     */
        init.then(() => {
          visaManagerService.loadPage.bind(() => {

            $scope.allItems = [];
            
            visaManagerService.getAllItemInvalidation()
            .then((el) => {
                Promise.all(el)
                .then(function(values) {
                  console.log("values",values)
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
            
        })

        $scope.headerList;


        /***
         * Recuperer toutes les cases à cocher
         */
        visaManagerService.getAllCase()
          .then(() => {
            visaManagerService.allCases.bind(() => {
                $scope.headerList = visaManagerService.allCases;
            })
          })

        // $scope.checkCase = (id,listValidation) => {
        //   let mod = FileSystem._objects[id];
          
        //   if(mod) {
        //     mod.valid.set(!mod.valid.get());
        //     $scope.checkValidation(listValidation);
        //   }
        // }

        // $scope.checkValidation = (listValidation) => {
        //   for (var i = 0; i < listValidation.validation.length; i++) {
        //     if(!listValidation.validation[i].valid.get()) {
        //       listValidation.isValid.set(false);
        //       return;
        //     }
        //   }

        //   listValidation.isValid.set(true);

        // }
        
        /****
         * Drag and drop
         */
        $scope.folderDropCfg = {
            "drop": (event) => {
              event.stopPropagation();
              event.preventDefault();
              let selected = spinalFileSystem.FE_selected_drag;
              $scope.loading = true;
              if (selected && selected[0]) {
                $scope.fs_path = Array.from(spinalFileSystem.FE_fspath_drag);
                let serv_id = FileSystem._objects[selected[0]._server_id];
                
                console.log(serv_id);



                $scope.loading = false;
              }
              return false;
            },
            "dragover": (event) => {
              event.preventDefault();
              return false;
            },
            "dragenter": (event) => {
              event.preventDefault();
              return false;
            }
  
        };


    }])
})();