(function(){
    angular.module('app.spinal-panel')
    .controller('adminVisaManagerCtrl',['spinalFileSystem','$scope',"visaManagerService","$mdDialog","$templateCache","displayFolderService","spinalModelDictionary","authService","ngSpinalCore",
    function(spinalFileSystem,$scope,visaManagerService,$mdDialog,$templateCache,displayFolderService,spinalModelDictionary,authService,ngSpinalCore){

    $scope.currentPage = 1;

    $scope.tableMenuContent = [{
        name : "Comments",
        icon : "comments"
    },{
        name : "Send",
        icon : "paper-plane"
    }]

    let init = visaManagerService.init()
    let allCase = visaManagerService.getAllCase();


    $scope.allItems = [];
    $scope.searchText = "";
    $scope.itemValid = "all";
    $scope.boxValid = "all";
    $scope.filterData = "all";

    $scope.fsdir = [];
    $scope.all_dir = {};
    $scope.selected_node = 0;


    $scope.boxChanged = (val) => {
        $scope.boxValid = val.boxValid;
    }
    
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
                    for (var i = 0; i < values.length; i++) {
                        if(values[i].length > 0) {
                            var x = values[i];
                            for (let index = 0; index < x.length; index++) {
                                $scope.allItems.push(x[index]);

                                $scope.$apply();
                            }
                        }
                    }

                    $scope.calculPourcentage();
                    
                },(err) => {
                    console.log(err)
                })

            })
        })

    })


    /****
     * 
     * Recuperer toutes les cases à cocher
     * 
     */
    allCase.then(() => {
        visaManagerService.allCases.bind(() => {
            $scope.myAllCases = visaManagerService.allCases;
        })
    })


    /****
     * 
     * Cocher une case
     * 
     */
    $scope.checkCase = (id,listValidation,checkbox) => {
        let mod = FileSystem._objects[id];

        if(mod) {
            mod.valid.set(checkbox);
            $scope.checkValidation(listValidation);
        }

    }


    /****
     * 
     * Verifier si un fichier est valide
     * 
     */
    $scope.checkValidation = (listValidation) => {
        var nombreSelect = 0;

        for (var i = 0; i < listValidation.validation.length; i++) {
            if(listValidation.validation[i].valid.get() == 1) {
                nombreSelect++;
            }
        }

        var pourcentage = Math.round((nombreSelect * 100 /listValidation.validation.length) * 100) / 100;
        

        listValidation.isValid.set(pourcentage);

    }


    /****
     * 
     * Changer de Page
     * 
     */
    $scope.goto = (pageNumber) => {
        $scope.currentPage = pageNumber;
        // if(pageNumber == 4) {
        //     $scope.drawGraph();
        // }
    }



    /****
     * 
     * Ajouter des infos à un dossier
     * 
     */
    $scope.addPluginInfo = (item,result,id,callback) => {
        
        if(!item._info.subvisaPlugin) {
            item._info.add_attr({
                subvisaPlugin : new Bool()
            })
        }

        item._info.subvisaPlugin.set(true);
        callback();
        
    }


    /****
     * 
     * Supprimer les info d'un dossier ou un fichier
     * 
     */
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



/*************************************************************************************************************************************************/

    /****
     * Supprimer un dossier
     * 
     */
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


    /****
     * Créer un dossier
     * 
     */
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
            var parent_id = displayFolderService.rootId;//spinalFileSystem.folderExplorer_dir[displayFolderService.rootId].model;

            console

            $mdDialog.show(confirm).then(function(result) {
                // for (var i = 0; i < parent_list.length; i++) {
                //     if(parent_list[i]._ptr.data.value == id) {
                //         $scope.addPluginInfo(parent_list[i],result,id,() => {
                //             parent_list[i].load((data) => {
                //                 data.add_file(result,new Directory(),{model_type : "Directory", admin : true});
                //             })
                //         })
                //     } 

                // }

                if(result && result.trim().length > 0)
                    FileSystem._objects[parent_id].add_file(result,new Directory(),{model_type : "Directory", admin : true});



            })

            return;

        }
        
        var id = obj.node.original.model;

        var parent_list = FileSystem._objects[parent_id];



        if(parent_list) {
            $mdDialog.show(confirm).then(function(result) {
                if(result && result.trim().length > 0){
                    for (var i = 0; i < parent_list.length; i++) {
                        if(parent_list[i]._ptr.data.value == id) {
                            $scope.addPluginInfo(parent_list[i],result,id,() => {
                                parent_list[i].load((data) => {
                                    data.add_file(result,new Directory(),{model_type : "Directory", admin : true});
                                })
                            })
                        } 

                    }
                }
            })    

        }

    }

    
    /****
     * 
     * Créer une action pour les buttons Create Folder, Delete et rename
     * 
     */
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


    /****
     * Renomer un dossier
     * 
     */
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


    /*****
     * 
     * Changer d'action (fonction exécutée)
     * 
     */
    $scope.changeAction = (app) => {
        if(app.label == "Delete") {
            app.action = $scope.deleteFolder;
        } else if(app.label == "New Folder...") {
            app.action = $scope.createFolder;
        }
    }


    /******
     * 
     * Menu du Folder organisation
     * 
     */
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


    /***
     * 
     * Recuperer l'arborescence des fichiers
     * 
     */
    $scope.treeCore = {
        themes: {
            name: "default-dark"
        },
        check_callback: $scope.DnD_callback
    };


    /****
     * 
     * Fonction exécutée à chaque changement dans Folder organisation
     * 
     */
    let listener_destructor = spinalFileSystem.subcribe("SPINAL_FS_ONCHANGE",() => {
        // spinalFileSystem.getFolderJson($scope.all_dir).then(res => {
        //     $scope.fsdir = displayFolderService.getFolderJson(res.tree);
        //     $scope.all_dir = displayFolderService.getTreeJson(res.all_dir);
        // });

        ngSpinalCore.load("__visa__").then((m) => {

            spinalFileSystem.getFolderJson_rec($scope.all_dir,m).then((res) => {
                $scope.fsdir = displayFolderService.formatFolderJson(res.tree);
                $scope.all_dir = displayFolderService.formatFolderJson(res.all_dir);
            })
        },() => {})

        

    });


    $scope.$on("$destroy", listener_destructor);


    $scope.onChangeNodeTree = (e, data) => {
        spinalFileSystem.onChangeNodeTree($scope.all_dir, data);
    };


    $scope.onbdlclick = event => {
        var node = $(event.target).closest("li");
        spinalFileSystem.onbdlclick($scope.all_dir, node[0].id);
    };


    spinalFileSystem.init().then(() => {
        
        ngSpinalCore.load("__visa__").then((m) => {

            spinalFileSystem.getFolderJson_rec($scope.all_dir,m).then((res) => {

                var myTree = Object.assign(res.tree);
                var myAll_dir = Object.assign(res.all_dir);

                $scope.fsdir = displayFolderService.formatFolderJson(myTree);
                $scope.all_dir = displayFolderService.formatFolderJson(myAll_dir);

            })
        },() => {})
    });


    // /****
    //  * 
    //  * Recuperer le detail des dossiers en format JSON
    //  * 
    //  */
    // spinalFileSystem.getFolderJson($scope.all_dir).then(res => {

    //     var myTree = res.tree.splice(0);
    //     var myAll_dir = Object.assign(res.all_dir);

    //     $scope.fsdir = displayFolderService.getFolderJson(myTree);
    //     $scope.all_dir = displayFolderService.getTreeJson(myAll_dir); //displayFolderService.getFolderJson(res.all_dir);

    // });

    
    
/*************************************************************************************************************************************************/

    /****
     * 
     * Recuperer tous les utilisateurs qui peuvent cocher une case
     * 
     */
    $scope.displayAllUsers = (users) => {
        var name = "";
        for (var i = 0; i < users.length; i++) {
            name += users[i].name + ','
        }

        return name;
    }


    /****
     * 
     * Modifier une case à cocher
     * 
     */
    $scope.editFileInfo = (ev,item) => {

        $mdDialog.show({
            controller: ["$scope",($scope) => {

                /**
                 * Recuperer tous les utilisateurs
                 */
                spinalModelDictionary.init().then(() => {
                    $scope.allUsers = spinalModelDictionary.users.get();
                    
                    $scope.allUsers.forEach(element => {
                        element.share_selected = false;
                        element._lowername = element.name.toLowerCase();
                    });

                })



                $scope.searchText = null;
                $scope.selectedItem = null;
                $scope.chip_users = [];


                /****
                 * 
                 * recuperer les infos la case à Modifier ou à Créer
                 * 
                 */
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


                /****
                 * recuperer les infos de l'utilisateur selectionné
                 */
                $scope.createFilterFor = query => {
                    var lowercaseQuery = query.toLowerCase();

                    return function filterFn(user) {
                    return (
                        user._lowername.indexOf(lowercaseQuery) === 0 ||
                        user.id.toString().indexOf(lowercaseQuery) === 0
                    );
                    };
                };



                /****
                 * Rechercher un utilisateur
                 */
                $scope.querySearch = query => {
                    var results = query
                      ? $scope.allUsers.filter($scope.createFilterFor(query))
                      : [];
                    return results;
                };

                
                /*****
                 * Ajouter un chip au champ de recherche
                 */
                $scope.transformChip = function(chip) {
                    if (angular.isObject(chip)) {
                      return chip;
                    }

                    return {
                      name: chip,
                      type: "new"
                    };
                };

                

                /****+
                 * Verifier si l'utilisateur n'est pas present dan la liste
                 */
                $scope.userExist = (myArray, item) => {
                    for (var i = 0; i < myArray.length; i++) {
                        if(myArray[i].id == item.id) {
                            return true
                        }
                    }

                    return false;
                }


                /*****
                 * 
                 * Ajouter un utilisateur à la liste
                 * 
                 */
                $scope.addUser = () => {
                    for (var i = 0; i < $scope.chip_users.length; i++) {
                        if(!$scope.userExist($scope.users,$scope.chip_users[i])) {
                            $scope.users.push($scope.chip_users[i]);
                        }
                    };

                    $scope.chip_users = [];
                }


                /****
                 * Supprimer un utilisateur de la liste
                 */
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
                            $scope.calculPourcentage();
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



    /****
     * Supprimer une case à cocher
     */
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
            $scope.calculPourcentage();
        },() => {});
    }
    
    
    /****
     * Recuperer le nombre de fichiers valides et invalides
     */
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


    /****
     * 
     * Recuperer le nombre de case cocher
     * 
     */
    $scope.GetCaseStatistique = () => {
        var pourcentages = [];

        for (var i = 0; i < $scope.myAllCases.length; i++) {
            var nbrValid = 0;
            var nbrInvalid = 0;

            var id = $scope.myAllCases[i].id.get();

            for (var j = 0; j < $scope.allItems.length; j++) {
                for (var k = 0; k < $scope.allItems[j]._info.visaValidation.validation.length; k++) {
                    if($scope.allItems[j]._info.visaValidation.validation[k].id.get() == id && $scope.allItems[j]._info.visaValidation.validation[k].valid.get() == 1) {
                        
                        nbrValid++;

                    } else if ($scope.allItems[j]._info.visaValidation.validation[k].id.get() == id && ($scope.allItems[j]._info.visaValidation.validation[k].valid.get() == 0 || $scope.allItems[j]._info.visaValidation.validation[k].valid.get() == -1)) {
                        
                        nbrInvalid++;

                    }
                }
            }

            pourcentages.push({name : $scope.myAllCases[i].name.get(), valid : nbrValid, invalid : nbrInvalid});

        }

        return pourcentages;

    }

    /****
     * Calcul du pourcentage
     */
    $scope.getPourcentageCase = () => {
        var stat = $scope.GetCaseStatistique();

        var pourcentage = [];

        for (var i = 0; i < stat.length; i++) {
            var item = stat[i];
            pourcentage.push(Math.round((item.valid * 100 / (item.valid + item.invalid)) * 100) / 100);
        }

        return pourcentage;

    }

    /****
     * Recuperer le label de toutes les cases
     */
    $scope.getCaseLabel = () => {
        var stat = $scope.GetCaseStatistique();

        var labels = [];

        for (var i = 0; i < stat.length; i++) {
            labels.push(stat[i].name);
        }

        return labels;
    }


    /**
     * Recuperer le backgound (rouge,orange ou vert)
     */
    $scope.getBackgroundColor = () => {
        var stat = $scope.GetCaseStatistique();

        var colors = [];

        for (var i = 0; i < stat.length; i++) {
            var item = stat[i];

            if((Math.round((item.valid * 100 /(item.valid + item.invalid)) * 100) / 100) < 50) {
                colors.push("red");
            } else if ((Math.round((item.valid * 100 /(item.valid + item.invalid)) * 100) / 100) >= 50 && (Math.round((item.valid * 100 /(item.valid + item.invalid)) * 100) / 100) < 70) {
                colors.push("orange");
            } else if ((Math.round((item.valid * 100 /(item.valid + item.invalid)) * 100) / 100) >= 70) {
                colors.push("green");
            }
        }

        return colors;

    }

    

    /****
     * 
     * Verifier si l'utilisateur respecte le temps de validation d'un fichier
     * 
     */
    $scope.getDateInfo = (item) => {
        var detail = {};

        var jourRestant = visaManagerService.getRemainingDay(item);
        var percentValid = item._info.visaValidation.isValid.get();

        detail['days'] = jourRestant;


        /** Si Une Case Invalide : condition à changer */
        if(visaManagerService.caseInvalid(item)) {
            detail["icon"] = "fa fa-times";
            detail["color"] = "red";
            detail["message"] = "fichier non valide";

        } else if(jourRestant <= 5 && jourRestant >= 0 && percentValid != 100) { /** Si jouRestant moins de 5jours */

            detail["icon"] = "fa fa-exclamation-triangle";
            detail["color"] = "orange";
            detail["message"] = "vous avez " + jourRestant  + " jour(s) pour valider ce fichier";

        } else if(jourRestant < 0 && percentValid != 100) { /** Si date limite depassée */

            detail["icon"] = "fa fa-exclamation";
            detail["color"] = "red";
            detail["message"] = "delai depassé";

        } else if(jourRestant > 5 && percentValid != 100) { /*** Si jourRestant superieur à 6 jours  */
            detail["icon"] = "fa fa-asterisk";
            detail["color"] = "blue";
            detail["message"] = "vous avez " + jourRestant  + " jour(s) pour valider ce fichier";

        }  else if(percentValid == 100){
            detail["icon"] = "fa fa-check";
            detail["color"] = "green";
            detail["message"] = "fichier validé";
        }

        return detail;

    }


    /**
     * 
     * Verifier si un utilisateur peux cocher une case
     */
    $scope.userCanCheck = (item) => {
        var users = item.users.get();
        var currentUser = authService.get_user();

        return visaManagerService.userCanValid(currentUser,users);
    }


    /****
     * 
     * Calculer le pourcentage de validation de tous les fichiers
     * 
     */
    $scope.calculPourcentage = () => {
        for (var i = 0; i < $scope.allItems.length; i++) {
            $scope.checkValidation($scope.allItems[i]._info.visaValidation);
        }
    }


    /**
     *  Executer l'action de l'item selectionné dans le menu
     */
    $scope.menuItemSelected = (menuItem,file,evt) => {
        switch (menuItem.name.toLowerCase()) {
            case "comments":
                $scope.addComment(file,evt);
                break;
            case "send":
                $scope.sendItem(file,evt);
                break;
                
        }
    }

    
    /***
     * 
     * ajouter un commentaire à un fichier
     * 
     */
    $scope.addComment = (item,evt) => {
        $mdDialog.show({
            controller : ["$scope","$mdDialog",function($scope,$mdDialog) {

                visaManagerService.getComments(item).then((comments) => {
                        $scope.messages = comments;
                    },() => {})

                $scope.messageInfo = {
                    user : authService.get_user(),
                    content : ""
                }
                
                $scope.addComment = () => {
                    visaManagerService.AddComments(item,$scope.messageInfo,() => {
                        $scope.messageInfo.content = "";
                    })
                }

                $scope.isUserMessage = (messageText) => {
                    if(messageText.user.username.get() == $scope.messageInfo.user.username)
                        return true;
                    return false;
                }

                $scope.deleteMessage = (message) => {

                    // var confirm = $mdDialog.confirm()
                    // .title('Remove !')
                    // .textContent('Do you want remove it ?')
                    // .ariaLabel('remove')
                    // .ok('Yes')
                    // .cancel('No');
                    
                    // $mdDialog.show(confirm).then(() => {
                        visaManagerService.deleteComment($scope.messages,message);
                    // },() => {})
                    
                }

                $scope.cancel = () => {
                    $mdDialog.cancel()
                }
            }],
            template : $templateCache.get('commentTemplate.html'),
            parent : angular.element(document.body),
            targetEvent : evt,
            clickOutsideToClose : true
        }).then((result) => {

        },() => {})
    }


    /***
     * 
     * Envoyer fichier à l'utilisateur une fois validé
     */
    $scope.sendItem = (item,evt) => {
        
        for (var i = 0; i < item._info.visaValidation.validation.length; i++) {
            if(item._info.visaValidation.validation[i].valid.get() == -1) {

                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title('Erreur')
                    .textContent('Verifiez que toutes les cases ont été cochées et réessayez !')
                    .ariaLabel('Alert')
                    .ok('OK')
                    .targetEvent(evt)
                );

                return
            }
        }

        // visaManagerService.loadPage.set(!visaManagerService.loadPage.get());
        // visaManagerService.deleteItemInVisa(item);

        var confirm = $mdDialog.prompt()
            .title('Message')
            .textContent('Voulez-vous ajouter un commentaire ?')
            .placeholder('Message')
            .ariaLabel('message')
            .initialValue('Aucun message')
            .targetEvent(evt)
            .required(false)
            .ok('Envoyer')
            .cancel('Annuler');

        
        $mdDialog.show(confirm).then(function (result) {

            if(item._info.visaValidation.sendComment) {
                item._info.visaValidation.sendComment.set(result);
            } else {
                item._info.visaValidation.add_attr({
                    sendComment : result
                })
            }

            visaManagerService.deleteItemInVisa(item,(item) => {

                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.body))
                    .clickOutsideToClose(true)
                    .title('Erreur')
                    .textContent('Item Envoyé avec succès !')
                    .ariaLabel('Alert')
                    .ok('OK')
                    .targetEvent(evt)
                ).then(() => {
                    $scope.allItems = [];
                    item._info.rem_attr("visaValidation");
                    visaManagerService.loadPage.set(!visaManagerService.loadPage.get());
                })
            });
        },() => {})

        
        

        


    }


    /***
     * Afficher les cases en fonction du filter
     */
    $scope.canBeDisplay = (caseItem) => {

        if($scope.boxValid == "allbox") {
            return true;
        } else if($scope.boxValid == "validbox" && (caseItem.canBeChecked.get() && $scope.userCanCheck(caseItem))) {
            return true;
        } else if ($scope.boxValid == "notValidbox" && (!caseItem.canBeChecked.get() || !$scope.userCanCheck(caseItem))) {
            return true;
        } else if($scope.boxValid == "boxnotValidbox" && caseItem.canBeChecked.get() && $scope.userCanCheck(caseItem) && !caseItem.valid.get()) {
            return true;
        }

        return false;

    }


    /****
     * Classer par validation
     */
    // $scope.orderByValidation = (iSelect) => {
    //     var itemFilter = $filter('itemFilter');

    //     switch (iSelect) {
    //         case "all":
    //             $scope.allItems = itemFilter()
    //             break;

    //         case "times":
    //             break;
            
    //         case "exclamation":
    //             break;

    //         case "valid":
    //             break;

    //         case "warning":
    //             break;
                
    //     }
    // }

    /****
     * Recuperer le choix de l'utilisateur et retourner le filter et l'icon
     */
    $scope.getFilterIcon = (value) => {

        var obj = {name : "" , color : ""};
        $scope.filterData = value;

        if(value == "all") {
            obj.name = "cube";
            obj.color = "white";

        } else if (value == "warning") {
            obj.name = "exclamation-triangle";
            obj.color = "orange";

        } else if (value == "times") {
            obj.name = "times";
            obj.color = "red";

        } else if (value == "valid") {
            obj.name = "check";
            obj.color = "green";

        } else if (value == "cool") {
            obj.name = "asterisk";
            obj.color = "blue";

        } else if(value == "exclamation") {
            obj.name = "exclamation";
            obj.color = "red";
        }

        return obj;

    }


    /****
     * Recuperer la couleur et l'icon dan le tableau
     */
    $scope.getValidationIcon = (item) => {
        var i = item.valid.get();

        var obj = {}
        if(i == 1) {
            obj["name"] = "check-square";
            obj["color"] = "green";
        } else if(i == 0) {
            obj["name"] = "times-circle";
            obj["color"] = "red";
        } else if(i == -1) {
            obj["name"] = "asterisk";
            obj["color"] = "blue";
        }

        return obj;
    }



    /****
     * Trier par validation
     */
    $scope.sortByValidation = (evt,myCase) => {
        $scope.sortNumber = (parseInt(evt.currentTarget.id) + 1) % 3;
        $scope.sortCaseId = myCase.id.get();
    }

    }])
})();