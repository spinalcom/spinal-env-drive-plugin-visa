
(function() {
    
    angular.module('app.spinal-panel')
    .factory('visaManagerService',["ngSpinalCore","authService","$q",function(ngSpinalCore,authService,$q){

        let factory = {};

        let user = authService.get_user();
        var initQ;
        var itemQ;
        var tabsQ;

        factory.listPromise = [];
        factory.allCases;
        
        ngSpinalCore.load_root()
                .then((data) => {
                    for (var i = 0; i < data.length; i++) {
                        if(data[i].name == "__visa__") {
                            factory.loadPage = data[i]._info.load_page;
                        }
                    }
                },() => {})


        factory.allTabs;

        /**
         * 
         * Initialisation pour verifier si le dossier __visa__ est créer, sinon on le crée !!
         * 
         ****/
        factory.init = () => {
            
            if(initQ) {
                
               return initQ.promise; 
            }


            initQ = $q.defer()


            ngSpinalCore.load('__visa__')
            .then((data) => {

                factory.allVisa = data;
                factory.loadPage.set(!factory.loadPage.get());
                initQ.resolve(factory.allVisa);

                return;
            },() => {

                factory.allVisa = new Directory();
                factory.loadPage = new Bool(true);

                ngSpinalCore.load_root()
                .then((data) => {
                                
                    data.add_file("__visa__",factory.allVisa,{model_type : "Directory", admin : true, isRoot : true, load_page : factory.loadPage,parameters : new ParameterModel()});
                    factory.loadPage.set(!factory.loadPage.get());
                    initQ.resolve(factory.allVisa);
                    
                    return
                },() => {})
                
                
                
            })
            
            
            return initQ.promise;

            
        }

        factory.init()


        /****
         * Recuperer le contenu d'un dossier
         */
        factory.loadItem = (item) => {
            return new Promise((resolve,reject) => {
                item.load((data) => {
                    resolve(data)
                },() => {
                    reject("error");
                })
            })
        }



        /****
         * 
         * Génerer un id unique
         * 
         */
        factory.newGuid = () => {
            var d = new Date().getTime();
            var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return guid;
        };


        /****
         * 
         * Return une promise qui contient le contenu du dossier donné en param
         * 
         */
        factory.getFolderItem = (item) => {
            if(item._info.subvisaPlugin) {

                item.load((data) => {
                    for (var i = 0; i < data.length; i++) {
                        factory.getFolderItem(data[i]);
                    }
                })

            } else {
                factory.listPromise.push(new Promise(function (resolve,reject) {
                    item.load((data) => {
                        resolve(data);
                    },() => {
                        reject("error !");
                    })
                }));
            }
        }


        /**
         * 
         * Return une liste de promises de tous les fichiers ajoutés pour valider
         * 
         * Trop lent (pourquoi j'ai ajouté setTimeout)
         * 
         */
        factory.getAllItemInvalidation = () => {

            factory.listPromise = [];

            return new Promise(function(resolve,reject) {
                for (var i = 0; i < factory.allVisa.length; i++) {
                    factory.getFolderItem(factory.allVisa[i]);
                }

                setTimeout(() => {
                    resolve(factory.listPromise);
                }, 1000);
            })
            

        }

        /***
         * 
         * Modifie l'attribut _info.visaValidation s'il existe sinon on le crée
         * 
         */

        factory.addPluginInfo = (item,path,data,listModel,callback) => {

            if(!item._info.visaValidation) {
                item._info.add_attr({
                    visaValidation : new VisaModel(data.message,data.stateId,listModel,path,Date.now(),data.validateBefore),
                })
                callback()
                return;                
            }
            
            for (var i = 0; i < listModel.length; i++) {
                listModel[i].valid = false;
            }

            item._info.visaValidation.message.set(data.message);
            item._info.visaValidation.state_id.set(data.stateId);
            item._info.visaValidation.validation.set(listModel);
            item._info.visaValidation.path.set(path);
            item._info.visaValidation.date.set(Date.now());
            item._info.visaValidation.validate_before.set(data.validateBefore);
            callback();

        }



        /***
         * 
         * Verifie si une case peut être cohée ou pas
         * 
         */

        factory.CanBeChecked = (id,listCase) => {
            for (var i = 0; i < listCase.length; i++) {
                if(listCase[i].id == id) {
                    if(listCase[i].checked) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }

            return false;
        }


        /****
         * 
         * Ajouter un fichier à valider
         * 
         */
        factory.addItemToValidate = (data,path,caseToCheck) => {

            let visaStateFolder = FileSystem._objects[data.stateId];
            let item = FileSystem._objects[data.itemId];
            let myList = [];


            if(visaStateFolder && item) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    myList.push({id : factory.allCases[i].id.get(), name : factory.allCases[i].name.get(), users : factory.allCases[i].users.get(),canBeChecked : factory.CanBeChecked(factory.allCases[i].id.get(),caseToCheck)});
                }

                factory.addPluginInfo(item,path,data,myList,() => {
                    visaStateFolder.load((data2) => {
                        data2.push(item);
                        factory.loadPage.set(!factory.loadPage.get());
                    })
                })

                
            }

        }  


        /***
         * 
         * Retourne la liste de toutes les cases à cocher (uniquement le nom des cases)
         * 
         */
        factory.ReturnlistCase = (data) => {

            if(!data._info.parameters.listCaseValidation) {
                data._info.parameters.add_attr({
                    listCaseValidation : new Lst()
                })
            }
            
            return data._info.parameters.listCaseValidation;
        }


        /**
         * 
         * Retourne la liste de toutes les cases à cocher
         * 
         */
        factory.getAllCase = () => {


            if(itemQ) {
                return itemQ.promise; 
            }
            itemQ = $q.defer()
            ngSpinalCore.load_root()
            .then((data) => {
                for (var i = 0; i < data.length; i++) {
                    if(data[i].name.get() == "__visa__") {

                        factory.allCases = data[i]._info.parameters.listCaseValidation ;//factory.ReturnlistCase(data[i]);
                        itemQ.resolve(data[i]);
                    }
                }
            })
        }

        factory.getAllCase();
        

        /****
         * 
         * Ajouter une case à la liste des cases à cocher
         * 
         */
        factory.AddValidationCase = (result,callback) => {

            var myCase;

            if(result.id) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    if(factory.allCases[i].id.get() == result.id) {
                        factory.allCases[i].name.set(result.name);
                        factory.allCases[i].description.set(result.description);
                        factory.allCases[i].users.set(result.users);
                        callback("edit",factory.allCases[i]);
                        break;
                    } 
                }
            } else {
                var caseValidation = new CaseValidation(factory.newGuid());
                caseValidation.name.set(result.name);
                caseValidation.description.set(result.description);
                caseValidation.users.set(result.users);
                
                factory.allCases.push(caseValidation);

                callback("add",caseValidation);
            }

            

        }


        /****
         * 
         * Ajouter la case qui a été créée à tous les fichiers
         * 
         */
        factory.AddCase = (allItems,x) => {
            for (var i = 0; i < allItems.length; i++) {
                allItems[i]._info.visaValidation.validation.push(new validModel(x.id,x.name,x.users,true));
            }
        }


        /****
         * 
         * Supprimer une case à cocher
         * 
         */
        factory.removeCase = (allItems,id) => {
            for (var i = 0; i < allItems.length; i++) {
                for (var j = 0; j < allItems[i]._info.visaValidation.validation.length; j++) {
                    if(allItems[i]._info.visaValidation.validation[j].id.get() == id) {
                        allItems[i]._info.visaValidation.validation.splice(j,1);
                    }
                }
            }
        }


        /****
         * 
         * Modifier une case à cocher
         * 
         */
        factory.editCase = (allItems,validModel) => {
            for (var i = 0; i < allItems.length; i++) {
                for (var j = 0; j < allItems[i]._info.visaValidation.validation.length; j++) {
                    if(allItems[i]._info.visaValidation.validation[j].id.get() == validModel.id.get()) {
                        allItems[i]._info.visaValidation.validation[j].name.set(validModel.name.get());
                        allItems[i]._info.visaValidation.validation[j].users.set(validModel.users.get());
                    }
                }
            }
        }


        /****
         * 
         * Ajouter tous les fichiers d'un dossier
         * load
         */
        factory.addFolderToValidate = (i,path,caseToCheck) => {

            var folder = FileSystem._objects[i.itemId];
            var icopy = i;
            

            if(folder._info.model_type.get().toLowerCase() == "directory") {
                factory.loadItem(folder).then((data) => {

                    for (var i = 0; i < data.length; i++) {
                        icopy.itemId = data[i]._server_id;

                        if(data[i]._info.model_type.get().toLowerCase() == "directory"){
                            factory.addFolderToValidate(icopy,path,caseToCheck);
                        } else {
                            factory.addItemToValidate(icopy,path,caseToCheck);
                        }
                    }

                },() => {

                })
            }
        }


        /****
         * 
         * Return le nombre de jour restant pour valider un fichier
         * 
         */
        factory.getRemainingDay = (item) => {
            var div = 86400000;
            var toDay = Date.now() / div; //convertir toDay en nbreDeJour

            var expiration = item._info.visaValidation.validate_before.get() / div;

            return new Number(expiration - toDay).toFixed(0);

        }


        /****
         * 
         * Verifier si un utilisateur peut cocher une case
         * 
         */
        factory.userCanValid = (user,userList) => {
            
            for (var i = 0; i < userList.length; i++) {
                if(userList[i].name == user.username) {
                    return true;
                }
            }

            return false;
        }



        /****
         * Recuperer les messages d'un fichier
         */

         factory.getComments = (item) => {
            if(!item._info.visaValidation.comments) {
                item._info.visaValidation.add_attr({
                    comments : new Lst()
                })
            }

            return new Promise((resolve, reject) => {
                resolve(item._info.visaValidation.comments);
            });

         }

        
        /***
         * Ajouter Comments
         */
        factory.AddComments = (item,messageInfo,callback) => {
            var messageModel = new MessageModel(factory.newGuid(),messageInfo.content,messageInfo.user,Date.now());

            item._info.visaValidation.comments.push(messageModel);
            callback();
        }


        /****
         * Supprimer un message
         */
        factory.deleteComment = (messages,message) => {
            for (var i = 0; i < messages.length; i++) {
                if(messages[i].id.get() == message.id.get()) {

                    messages.splice(i,1);
                    break;
                    
                }
            }
        }


        /****
        * Verifier si un fichier a une case Invalid
        */
        factory.caseInvalid = (item) => {
            for (var i = 0; i < item._info.visaValidation.validation.length; i++) {
                if(item._info.visaValidation.validation[i].valid.get() == 0) {
                    return true;
                }
            }
            return false;
        }
        

        factory.getItem = (item,itemList,cpt,paths,callback) => {

            if(cpt + 1 < paths.length) {

                for (var i = 0; i < itemList.length; i++) {
                    if(itemList[i].name.get() == paths[cpt]) {
                        itemList[i].load((data) => {
                            factory.getItem(item,data,cpt + 1, paths,callback);
                        })
                        break;
                    }
                }

            } else {

                for (var i = 0; i < itemList.length; i++) {
                    if(itemList[i]._server_id == item._server_id) {

                        if(!itemList[i]._info.stateVisaValidation) {
                            itemList[i]._info.add_attr({
                                stateVisaValidation : new Lst()
                            })
                        }
                
                        
                        itemList[i]._info.visaValidation.add_attr({
                            send_date : Date.now()
                        })
                
                        itemList[i]._info.stateVisaValidation.push(itemList[i]._info.visaValidation);

                        itemList.splice(i,1);

                        callback(item);
                        break;
                    }
                }


            }

        }


        /****
         * 
         * Supprimer un fichier
         */

        factory.deleteItemInVisa = (item,callback) => {
            
            var paths = item._info.visaValidation.path.get().split("/");

            var cpt = 1;

            factory.getItem(item,factory.allVisa,cpt,paths,callback);

        }


        /****
         * 
         * Recuperer les tabs
         * 
         */
        factory.getTabs = () => {
            if(tabsQ) {
                return tabsQ.promise; 
            }
            tabsQ = $q.defer()
            ngSpinalCore.load_root()
            .then((data) => {
                for (var i = 0; i < data.length; i++) {
                    if(data[i].name.get() == "__visa__") {

                        factory.allTabs = data[i]._info.parameters.tabs ;//factory.ReturnlistCase(data[i]);
                        tabsQ.resolve(data[i]);
                    }
                }
            })
        }

        factory.getTabs();

        return factory;

    }])

})();