(function(){
    angular.module('app.spinal-panel')
    .controller('adminVisaManagerCtrl',['spinalFileSystem','$scope',"visaManagerService","$mdDialog","$templateCache","$rootScope","$compile",function(spinalFileSystem,$scope,visaManagerService,$mdDialog,$templateCache,$rootScope,$compile){

    $scope.currentPage = 1;

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
        console.log(item)
        if(item.length == 0) {
            var parent_id = spinalFileSystem.folderExplorer_dir[item._ptr.data.value].model;

            var parent_list = FileSystem._objects[parent_id];

            for (var i = 0; i < parent_list.length; i++) {
                if(parent_list[i]._server_id == item._server_id) {
                    parent_list[i].rem_attr("subvisaPlugin");
                    console.log("empty !");
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

        var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;
        var id = obj.node.original.model;

        var parent_list = FileSystem._objects[parent_id];

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

        var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;
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

        var parent_id = spinalFileSystem.folderExplorer_dir[obj.node.original.parent].model;
        var id = obj.node.original.model;


        var parent_list = FileSystem._objects[parent_id];

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
            $scope.changeAction(app)
            res[app.name] = {
                label: app.label,
                icon: app.icon,
                action: $scope.create_action_callback(node, app)
            };
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
            $scope.fsdir = res.tree;
            $scope.all_dir = res.all_dir;
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
        $scope.fsdir = res.tree;
        $scope.all_dir = res.all_dir;
    });
    


    $scope.editFileInfo = (ev,item) => {
        $mdDialog.show({
            controller: ["$scope",($scope) => {
                
                $scope.Cases = [];

                for (var i = 0; i < item._info.visaValidation.validation.length; i++) {
                    var obj = {};
                    var x = item._info.visaValidation.validation[i];
                    obj["name"] = x.name.get();
                    obj["value"] = false;
                    $scope.Cases.push(obj);
                }


                $scope.cancel = function() {
                    $mdDialog.cancel();
                }
    
                $scope.answer = function() {
    
                }
    
    
            }],
            template : $templateCache.get('permissionTemplate.html'),
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
            .then(function(answer) {
                


            }, () => {});
    }


    


    }])
})();