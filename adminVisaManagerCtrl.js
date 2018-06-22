(function(){
    angular.module('app.spinal-panel')
    .controller('adminVisaManagerCtrl',['spinalFileSystem','$scope',"visaManagerService","$mdDialog","$templateCache","$rootScope","$compile","displayFolderService","spinalModelDictionary",
    function(spinalFileSystem,$scope,visaManagerService,$mdDialog,$templateCache,$rootScope,$compile,displayFolderService,spinalModelDictionary){

    $scope.currentPage = 1;

    let init = visaManagerService.init()
    let allCase = visaManagerService.getAllCase();


    $scope.allItems = [];
    $scope.searchText = "";
    $scope.itemValid = "all";


    init.then(() => {
        visaManagerService.loadPage.bind(() => {
            $scope.allItems = [];
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

    })

    allCase.then(() => {
        visaManagerService.allCases.bind(() => {
            $scope.myAllCases = visaManagerService.allCases;
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
        var nombreSelect = 0;

        for (var i = 0; i < listValidation.validation.length; i++) {
            if(listValidation.validation[i].valid.get()) {
                nombreSelect++;
            }
        }

        var pourcentage = Math.round((nombreSelect * 100 /listValidation.validation.length) * 100) / 100;
        

        listValidation.isValid.set(pourcentage);

    }

    $scope.goto = (pageNumber) => {
        $scope.currentPage = pageNumber;
        // if(pageNumber == 4) {
        //     $scope.drawGraph();
        // }
    }


    $scope.addPluginInfo = (item,result,id,callback) => {
        
        if(!item._info.subvisaPlugin) {
            item._info.add_attr({
                subvisaPlugin : new Bool()
            })
        }

        item._info.subvisaPlugin.set(true);
        callback();
        
    }

    $scope.removePluginInfo = (item) => {
        if(item.length == 0) {
            var parent_id = spinalFileSystem.folderExplorer_dir[item._ptr.data.value].model;

            var parent_list = FileSystem._objects[parent_id];

            for (var i = 0; i < parent_list.length; i++) {
                if(parent_list[i]._server_id == item._server_id) {
                    parent_list[i].rem_attr("subvisaPlugin");
                }
            }


        } else {
            console.log("not empty !");
        }
    }

    $scope.fsdir = [];
    $scope.all_dir = {};
    $scope.selected_node = 0;

    $scope.deleteFolder = (obj) => {
        var confirm = $mdDialog.confirm()
        .title('Remove !')
        .textContent('Do you want remove it ?')
        .ariaLabel('remove')
        .ok('Yes')
        .cancel('No');

        if(obj.node.original.parent != "#"){
            var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;
            var id = obj.node.original.model;

            var parent_list = FileSystem._objects[parent_id];
        } else {
            alert("Sorry you can't remove this file !");
        }

        if(parent_list) {
            $mdDialog.show(confirm).then(() => {
                for (var i = 0; i < parent_list.length; i++) {
                    if(parent_list[i]._ptr.data.value == id) {
                        parent_list.remove_ref(parent_list[i]);
                        // $scope.removePluginInfo(parent_list);
                    }
                }
              },() => {});
            
        }
    }

    $scope.createFolder = (obj) => {
        
        var confirm = $mdDialog.prompt()
        .title('Folder Name')
        .placeholder('Folder Name')
        .ariaLabel('Folder name')
        .required(true)
        .ok('Ok')
        .cancel('Cancel');


        if(obj.node.original.parent != "#"){

            var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;

        } else {
            var parent_id = spinalFileSystem.folderExplorer_dir[displayFolderService.rootId].model;
        }
        var id = obj.node.original.model;

        var parent_list = FileSystem._objects[parent_id];



        if(parent_list) {
            $mdDialog.show(confirm).then(function(result) {
                for (var i = 0; i < parent_list.length; i++) {
                    if(parent_list[i]._ptr.data.value == id) {
                        $scope.addPluginInfo(parent_list[i],result,id,() => {
                            parent_list[i].load((data) => {
                                data.add_file(result,new Directory(),{model_type : "Directory"});
                            })
                        })
                    } 

                }
            })    

        }

    }

    
    $scope.create_action_callback = (node, app) => {
        return function() {
            let share_obj = {
                node: node,
                model_server_id: node.original.model,
                scope: $scope
            };
            app.action(share_obj);

        };
    };

    $scope.RenameFolder = (obj) => {
        var confirm = $mdDialog.prompt()
        .title('Folder Name')
        .placeholder('Folder Name')
        .ariaLabel('Folder name')
        .required(true)
        .ok('Ok')
        .cancel('Cancel');

        if(obj.node.original.parent != "#") {
            var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;
            var id = obj.node.original.model;
            var parent_list = FileSystem._objects[parent_id];
        } else {
            alert("Sorry You can't rename this file!!");
        }
        

        if(parent_list) {
            $mdDialog.show(confirm).then(function(result) {
                for (var i = 0; i < parent_list.length; i++) {
                    if(parent_list[i]._ptr.data.value == id) {
                        parent_list[i].name.set(result);
                    } 

                }
            })    

        }

    }

    $scope.changeAction = (app) => {
        if(app.label == "Delete") {
            app.action = $scope.deleteFolder;
        } else if(app.label == "New Folder...") {
            app.action = $scope.createFolder;
        }
    }


    $scope.contextMenu = (node) => {

        var menu = [
            { name : "RenameFolderExplorer", label : "rename" , icon : "fa fa-pencil", description : "Rename File", order_priority : 0, action : $scope.RenameFolder}
        ]

        let apps = window.spinalDrive_Env.get_applications("FolderExplorer",node);

        for (var i = 0; i < menu.length; i++) {
            apps.push(menu[i])
        }

        let res = {};

        for (var i = 0; i < apps.length; i++) {
            let app = apps[i];
            if(app.label != "Share...") {
                $scope.changeAction(app)
                    res[app.name] = {
                    label: app.label,
                    icon: app.icon,
                    action: $scope.create_action_callback(node, app)
                };
            }
        }


        return res;

    };


    $scope.treeCore = {
        themes: {
            name: "default-dark"
        },
        check_callback: $scope.DnD_callback
    };


    let listener_destructor = spinalFileSystem.subcribe("SPINAL_FS_ONCHANGE",() => {
        spinalFileSystem.getFolderJson($scope.all_dir).then(res => {
            $scope.fsdir = displayFolderService.getFolderJson(res.tree);
            $scope.all_dir = displayFolderService.getTreeJson(res.all_dir);
        });
    });


    $scope.$on("$destroy", listener_destructor);


    $scope.onChangeNodeTree = (e, data) => {
        spinalFileSystem.onChangeNodeTree($scope.all_dir, data);
    };


    $scope.onbdlclick = event => {
        var node = $(event.target).closest("li");
        spinalFileSystem.onbdlclick($scope.all_dir, node[0].id);
    };


    spinalFileSystem.init();


    spinalFileSystem.getFolderJson($scope.all_dir).then(res => {

        var myTree = res.tree.splice(0);
        var myAll_dir = Object.assign(res.all_dir);

        $scope.fsdir = displayFolderService.getFolderJson(myTree);
        $scope.all_dir = displayFolderService.getTreeJson(myAll_dir); //displayFolderService.getFolderJson(res.all_dir);  

    });
    
    $scope.displayAllUsers = (users) => {
        var name = "";
        for (var i = 0; i < users.length; i++) {
            name += users[i].name + ','
        }

        return name;
    }



/*------------------------------------------------------- A Modifier -------------------------------------------------*/

    $scope.editFileInfo = (ev,item) => {

        $mdDialog.show({
            controller: ["$scope",($scope) => {

                spinalModelDictionary.init().then(() => {
                    $scope.allUsers = spinalModelDictionary.users.get();
                    
                    $scope.allUsers.forEach(element => {
                        element.share_selected = false;
                        element._lowername = element.name.toLowerCase();
                    });

                })



                $scope.searchText = null;
                $scope.selectedItem = null;

                if(item) { 
                    $scope.title = "edit case";
                    $scope.name = item.name.get();
                    $scope.description = item.description.get();
                    $scope.id = item.id.get();
                    $scope.users = item.users.get();
                } else {
                    $scope.title = "Add case";
                    $scope.name = ""
                    $scope.description = ""
                    $scope.users = []; 
                }

                

/********************************************************************************************************************************************************************************************/
 
                $scope.createFilterFor = query => {
                    var lowercaseQuery = angular.lowercase(query);

                    return function filterFn(user) {
                    return (
                        user._lowername.indexOf(lowercaseQuery) === 0 ||
                        user.id.toString().indexOf(lowercaseQuery) === 0
                    );
                    };
                };

                $scope.querySearch = query => {
                    var results = query
                      ? $scope.allUsers.filter($scope.createFilterFor(query))
                      : [];
                    return results;
                };

                $scope.transformChip = function(chip) {
                    // If it is an object, it's already a known chip
                    if (angular.isObject(chip)) {
                      return chip;
                    }
                    // Otherwise, create a new one
                    return {
                      name: chip,
                      type: "new"
                    };
                };

                $scope.chip_users = [];


/********************************************************************************************************************************************************************************************/

                $scope.userExist = (myArray, item) => {
                    for (var i = 0; i < myArray.length; i++) {
                        if(myArray[i].id == item.id) {
                            return true
                        }
                    }

                    return false;
                }

                $scope.addUser = () => {
                    for (var i = 0; i < $scope.chip_users.length; i++) {
                        if(!$scope.userExist($scope.users,$scope.chip_users[i])) {
                            $scope.users.push($scope.chip_users[i]);
                        }
                    };

                    $scope.chip_users = [];
                }


                $scope.deleteUser = (id) => {
                    for (var i = 0; i < $scope.users.length; i++) {
                        if($scope.users[i].id == id) {
                            $scope.users.splice(i,1);
                            break;
                        }
                    }
                }

                $scope.cancel = function() {
                    $mdDialog.cancel();
                }
    
                $scope.answer = function() {
                    var result = {id : $scope.id, name : $scope.name, description : $scope.description, users : $scope.users };

                    if($scope.name.trim().length > 0 && $scope.name.trim().length <= 4) {
                        $mdDialog.hide(result);
                    }
                }
    
    
            }],
            template : $templateCache.get('permissionTemplate.html'),
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
            .then(function(answer) {
                
                visaManagerService.AddValidationCase(answer, (state,item) => {
                    switch (state) {
                        case "add":
                            visaManagerService.AddCase($scope.allItems,{id : item.id,name : item.name,users : item.users});
                            break;
                        case "edit":
                            var x = new validModel(item.id,item.name,item.users);
                            visaManagerService.editCase($scope.allItems,x);
                            break;
                        default :

                            
                    }
                });


            }, () => {});
    }


    $scope.deleteValidationCase = (myCase) => {

        var confirm = $mdDialog.confirm()
        .title('Remove !')
        .textContent('Do you want remove it ?')
        .ariaLabel('remove')
        .ok('Yes')
        .cancel('No');

        $mdDialog.show(confirm).then(() => {
            for (var i = 0; i < visaManagerService.allCases.length; i++) {
                if(visaManagerService.allCases[i].id.get() == myCase.id.get()) {
                    visaManagerService.allCases.splice(i,1);
                    visaManagerService.removeCase($scope.allItems,myCase.id.get());
                }
            }
        },() => {});
    }
    

    $scope.ItemsValidCount = () => {
        var cptValid = 0;
        var cptInValid = 0;
        for (var i = 0; i < $scope.allItems.length; i++) {
            if($scope.allItems[i]._info.visaValidation.isValid == 100) {
                cptValid++;
            } else {
                cptInValid++;
            }
        }

        return [cptValid , cptInValid];

    }

    $scope.drawGraph = () => {
        var container = document.querySelector("canvas#myChart");

        console.log(container);
        
        // var myPieChart = new Chart(ctx,{
        //     type : 'pie',
        //     data : {
        //         datasets : [{
        //             data : $scope.ItemsValidCount()
        //             // color : ["green","red"]
        //         }],
        //         labels : [
        //             'Valid',
        //             'Not Valid'
        //         ]
        //     },
        //     options : {
        //         color : ["green","red"]
        //     }
        // })

    }

    
    }])
})();