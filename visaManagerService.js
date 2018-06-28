
(function() {
    
    angular.module('app.spinal-panel')
    .factory('visaManagerService',["ngSpinalCore","authService","$q",function(ngSpinalCore,authService,$q){

        let factory = {};
        let user = authService.get_user();
        var initQ;
        var itemQ;

        factory.listPromise = [];
        factory.allCases;
        factory.loadPage = new Bool(true);


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
            ngSpinalCore.load_root()
            .then((data) => {
                

                for (var i = 0; i < data.length; i++) {
                    if(data[i].name.get() == "__visa__") {
                        data[i].load((m) => {
                            factory.allVisa = m;
                            factory.loadPage.set(!factory.loadPage.get());
                            initQ.resolve(factory.allVisa);
                        })
                        
                        return;
                        
                    }
                    
                }

                factory.allVisa = new Directory();
                let _visa = new Directory();

                data.add_file("__visa__",_visa,{model_type : "Directory"});
                factory.loadPage.set(!factory.loadPage.get());

                initQ.resolve(factory.allVisa);

            },() => { })
            
            return initQ.promise;

            
        }

        factory.init()



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


        factory.addVisaState = (name,validList) => {   
            var myDirectory = new Directory();

            factory.allVisa.add_file(name,myDirectory,{listVisaValidation : validList});    

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


        /****
         * 
         * Ajouter un item à valider
         * 
         */
        factory.addItemToValidate = (data,path) => {

            let visaStateFolder = FileSystem._objects[data.stateId];
            let item = FileSystem._objects[data.itemId];
            let myList = [];


            if(visaStateFolder && item) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    myList.push({id : factory.allCases[i].id.get(), name : factory.allCases[i].name.get(), users : factory.allCases[i].users.get()});
                }

                factory.addPluginInfo(item,path,data,myList,() => {
                    visaStateFolder.load((data2) => {
                        data2.push(item);
                        factory.loadPage.set(!factory.loadPage.get());
                    })
                })

                
            }

        }  

        factory.ReturnlistCase = (data) => {
            if(!data._info.listCaseValidation) {
                data._info.add_attr({
                    listCaseValidation : new Lst()
                })
            }

            return data._info.listCaseValidation;
        }


        factory.getAllCase = () => {
            if(itemQ) {
                return itemQ.promise; 
            }
            itemQ = $q.defer()
            ngSpinalCore.load_root()
            .then((data) => {
                for (var i = 0; i < data.length; i++) {
                    if(data[i].name.get() == "__visa__") {
                        factory.allCases = factory.ReturnlistCase(data[i]);
                        itemQ.resolve(data[i]);
                    }
                }
            })
        }

        factory.getAllCase();
        

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


        factory.AddCase = (allItems,x) => {
            for (var i = 0; i < allItems.length; i++) {
                allItems[i]._info.visaValidation.validation.push(new validModel(x.id,x.name,x.users));
            }
        }

        factory.removeCase = (allItems,id) => {
            for (var i = 0; i < allItems.length; i++) {
                for (var j = 0; j < allItems[i]._info.visaValidation.validation.length; j++) {
                    if(allItems[i]._info.visaValidation.validation[j].id.get() == id) {
                        allItems[i]._info.visaValidation.validation.splice(j,1);
                    }
                }
            }
        }

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


        factory.addFolderToValidate = () => {

        }

        factory.getRemainingDay = (allList,item = null) => {
            var div = 86400000;
            var toDay = Date.now() / div; //convertir toDay en nbreDeJour

            for (var i = 0; i < allList.length; i++) {
                var expiration = allList[i]._info.visaValidation.validate_before.get() / div;
                console.log(new Number(expiration - toDay).toFixed(0));
            }

            // var expiration = item._info.visaValidation.validate_before.get() / div;

            // return new Number(expiration - toDay).toFixed(0);

        }

        return factory;

    }])

})();