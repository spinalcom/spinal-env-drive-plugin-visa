
(function() {
    
    angular.module('app.spinal-panel')
    .factory('visaManagerService',["ngSpinalCore","authService","$q",function(ngSpinalCore,authService,$q){

        let factory = {};
        let user = authService.get_user();
        var initQ;

        factory.listPromise = new Lst();

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
                            for (var j = 0; j < m.length; j++) {
                                if(m[j].name.get() == "__visa_to_validate__") {
                                    m[j].load((el) => {

                                    factory.allVisa = el;
                                    initQ.resolve(el);

                                        // for (var k = 0; k < el.length; k++) {
                                        //     if(el[k].name.get() == user.username) {
                                        //         el[k].load((el2) => {
                                        //             factory.allVisa = el2;
                                        //             initQ.resolve(el2);
                                        //         })

                                        //         return;
                                        //     }
                                        // }

                                        // factory.allVisa = new Directory();
                                        // el.add_file(user.username,new Directory(),{model_type : "Directory"})
                                        // initQ.resolve(factory.allVisa);

                                    })
                                    return;
                                }
                            }

                            factory.allVisa = new Directory();
                            m.add_file("__visa_to_validate__",factory.allVisa,{model_type : "Directory"});
                            initQ.resolve(factory.allVisa);

                            // let _visa_to_validate = new Directory();

                            // _visa_to_validate.add_file(user.username,new Directory(),{model_type : "Directory"})

                            // m.add_file("__visa_to_validate__",_visa_to_validate,{model_type : "Directory"});
                            // initQ.resolve(factory.allVisa);
                            
                        })
                        
                        return;
                        
                    }
                    
                }

                factory.allVisa = new Directory();
                let _visa = new Directory();

                _visa.add_file("__visa_to_validate__",new Directory,{model_type : "Directory"});
                data.add_file("__visa__",_visa,{model_type : "Directory"});

                // factory.allVisa = new Directory();
                // let _visa = new Directory();
                // let _visa_to_validate = new Directory();


                // _visa_to_validate.add_file(user.username,new Directory(),{model_type : "Directory"})
                // _visa.add_file("__visa_to_validate__",_visa_to_validate,{model_type : "Directory"});
                // data.add_file("__visa__",_visa ,{ model_type : "Directory"});


                initQ.resolve(factory.allVisa);


            },() => {
            })

            return initQ.promise
        }


        factory.init();


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

            if(visaStateFolder && item) {
                
                factory.addPluginInfo(item,path,data,visaStateFolder._info.listVisaValidation,() => {
                    visaStateFolder.load((data2) => {
                        data2.push(item);
                        item._parents.splice(item._parents.indexOf(item),1);
                    })
                })

                
            }

        }
        
        




        return factory;

    }])

})();