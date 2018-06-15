
(function() {
    
    angular.module('app.spinal-panel')
    .factory('visaManagerService',["ngSpinalCore","authService","$q",function(ngSpinalCore,authService,$q){

        let factory = {};
        let user = authService.get_user();
        var initQ;
        var itemQ;
        var $scope = 

        factory.listPromise = [];
        factory.allCases;

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
                            initQ.resolve(factory.allVisa);
                            
                        })
                        
                        return;
                        
                    }
                    
                }

                factory.allVisa = new Directory();
                let _visa = new Directory();

                data.add_file("__visa__",_visa,{model_type : "Directory"});
                initQ.resolve(factory.allVisa);

            },() => { })
            
            return initQ.promise;

            
        }

        factory.init()


        factory.newGuid = () => {
            var d = new Date().getTime();
            var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return guid;
        };


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


        factory.addPluginInfo = (item,path,data,listModel,callback) => {

            if(!item._info.visaValidation) {
                item._info.add_attr({
                    visaValidation : new VisaModel(data.message,data.stateId,listModel,path,Date.now()),
                })
                callback()
                return;                
            }
            
            item._info.visaValidation.message.set(data.message);
            item._info.visaValidation.state_id.set(data.stateId);
            item._info.visaValidation.validation = listModel;
            item._info.visaValidation.path.set(path);
            item._info.visaValidation.date.set(Date.now());
            callback();

        }


        factory.addItemToValidate = (data,path) => {

            let visaStateFolder = FileSystem._objects[data.stateId];
            let item = FileSystem._objects[data.itemId];
            let myList = [];

            console.log(factory.allVisa);
            console.log(visaStateFolder);

            if(visaStateFolder && item) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    myList.push({id : factory.allCases[i].id.get(),name : factory.allCases[i].name.get()})
                }

                factory.addPluginInfo(item,path,data,myList,() => {
                    visaStateFolder.load((data2) => {
                        data2.push(item);
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
        

        factory.AddValidationCase = (result) => {

            if(result.id) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    if(factory.allCases[i].id.get() == result.id) {
                        factory.allCases[i].name.set(result.name);
                        factory.allCases[i].description.set(result.description);
                        factory.allCases[i].users.set(result.users);
                        break;
                    } 
                }
            } else {
                var caseValidation = new CaseValidation(factory.newGuid());
                caseValidation.name.set(result.name);
                caseValidation.description.set(result.description);
                caseValidation.users.set(result.users);
                
                factory.allCases.push(caseValidation);
            }

        }


/*----------------------------------------------- A Modier --------------------------------------------------*/

        factory.AddCase = () => {

        }

        factory.removeCase = () => {

        }

        factory.editCase = () => {
            
        }

        return factory;

    }])

})();