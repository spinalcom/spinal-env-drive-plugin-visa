factory.addFolder = (item,groupId,processId,priority,myPath) => {
                
    if(item._info.model_type.get() == "Directory") {
        myPath += item.name.get() + "/";

        factory.loadItem(item)
            .then((data1) => {
                for (var i = 0; i < data1.length; i++) {
                    if(data1[i]._info.model_type.get() == "Directory") {
                        factory.addFolder(data1[i],groupId,processId,priority,myPath);
                    } else {
                        let _ser_id = data1[i]._server_id;
                        let myData = data1[i];
                        // data1[i]._info.ProcessPlugin.load((el) => {
                        //     
                        // })

                        if(data1[i]._info.ProcessPlugin) {
                            factory.loadItem(data1[i]._info.ProcessPlugin).then((el) => {
                                factory.deleteItem(_ser_id,el.groupId.get(),el.processId.get(),el.priority.get(),() => {
                                    factory.addItemInProcess(myData,groupId,processId,priority,myPath);
                                });
                            })
                            
                        } else {
                            factory.addItemInProcess(data1[i],groupId,processId,priority,myPath);
                        }
                        

                        
                    }
                }
            },() => {})
    }            
}