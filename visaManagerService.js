
(function() {
    
    angular.module('app.spinal-panel')
    .factory('visaManagerService',["ngSpinalCore","authService","$q",function(ngSpinalCore,authService,$q){

        let factory = {};
        let user = authService.get_user();
        var initQ;
        var itemQ;

        factory.listPromise = new Lst();
        factory.allCases;

        factory.init = () => {
            console.log("start init");
            
            if(initQ) {
                console.log("init extst");
                
               return initQ.promise; 
            }


            initQ = $q.defer()
            ngSpinalCore.load_root()
            .then((data) => {
                

                for (var i = 0; i < data.length; i++) {
                    if(data[i].name.get() == "__visa__") {
                        data[i].load((m) => {
                            console.log("m",m);
                            factory.allVisa = m;
                            console.log("factory.init",factory.allVisa);
                            initQ.resolve(factory.allVisa);
                            
                        })
                        
                        return;
                        
                    }
                    
                }

                factory.allVisa = new Directory();
                let _visa = new Directory();

                data.add_file("__visa__",_visa,{model_type : "Directory"});
                console.log("xcvsvf")
                initQ.resolve(factory.allVisa);

            },() => { })
            console.log("init exist 2");
            
            return initQ.promise;

            
        }

        factory.init().then(() => {});


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
                console.log("get All item ")
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
            
            item._info.visaValidation.info.message.set(data.message);
            item._info.visaValidation.info.state_id.set(data.stateId);
            item._info.visaValidation.validation = listModel;
            item._info.visaValidation.path.set(path);
            item._info.visaValidation.date.set(Date.now());
            callback();

        }


        factory.addItemToValidate = (data,path) => {

            let visaStateFolder = FileSystem._objects[data.stateId];
            let item = FileSystem._objects[data.itemId];
            let myList = [];

            if(visaStateFolder && item) {
                for (var i = 0; i < factory.allCases.length; i++) {
                    myList.push(factory.allCases[i].name.get())
                }
                factory.addPluginInfo(item,path,data,myList,() => {
                    visaStateFolder.load((data2) => {
                        data2.push(item);
                        item._parents.splice(item._parents.indexOf(item),1);
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

            console.log(result);

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

        return factory;

    }])

})();