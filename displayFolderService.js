(function(){

angular.module('app.spinal-panel')
.factory('displayFolderService',["ngSpinalCore",function(ngSpinalCore) {

    let factory = {};


    ngSpinalCore.load("__visa__").then((m) => {
        factory.rootId = m._server_id;
    })


    factory.formatFolderJson = (tree) => {
        var x = tree;
        for (var i = 0; i < tree.length; i++) {
            if(tree[i].parent == "#") {
                tree[i].text = "";
                break;
            }
        }

        return x;
    }

    // factory.rootId;

    // factory.getRoot = (all_dir) => {

    //     for (var i = 0; i < all_dir.length; i++) {
    //         if(all_dir[i].parent == "#") {
    //             factory.rootId = all_dir[i].id;
    //             return all_dir[i];
    //         }
    //     }

    // }

    // factory.allToRemove = [];

    // factory.getItemId = (all_dir,item) => {
    //     var x = [];

    //     for (var i = 0; i < all_dir.length; i++) {

    //         if(all_dir[i].parent == item && all_dir[i].text != "__visa__") {
    //             x.push(all_dir[i].id);
    //         }
    //     }

    //     return x;
    // }

    // function exist(it,items) {
    //     for (var i = 0; i < items.length; i++) {
    //         if(items[i] == it)
    //             return true
    //     }
    //     return false;
    // }

    // factory.getAllChild = (all_dir,items) => {
    //     var x = [];

    //     for (var i = 0; i < all_dir.length; i++) {
    //         if(exist(all_dir[i].parent,items)) {
    //             x.push(all_dir[i].id);
    //             factory.allToRemove.push(all_dir[i].id)
    //         }
    //     }

    //     if(x.length > 0) {
    //         return factory.getAllChild(all_dir,x);
    //     } else {
    //         return factory.allToRemove;
    //     }

    // }

    // factory.removeAll = (all_dir,root,items) => { 

    //     for (var i = 0; i < items.length; i++) {

    //         for (var j = 0; j < all_dir.length; j++) {                
    //             if(all_dir[j].text == "__visa__") {
    //                 all_dir[j].parent = "#";
    //             }
    //             if((all_dir[j].id == items[i] || all_dir[j].parent == items[i] || all_dir[j].id == root) && all_dir[j].text != "__visa__") { //A changer
    //                 all_dir.splice(j,1);
    //                 j--;
    //             }
    //         }

    //     }

    //     return all_dir;

    // }

    // factory.getFolderJson = (all_dir) => {

    //     var root = factory.getRoot(all_dir);

    //     factory.allToRemove = factory.getItemId(all_dir,root.id);

    //     factory.getAllChild(all_dir,factory.allToRemove);

    //     return factory.removeAll(all_dir,root.id,factory.allToRemove);

    // }


    // factory.getTreeJson = (all_tree) => {

    //     for (var i = 0; i < factory.allToRemove.length; i++) {
    //         if (all_tree[factory.allToRemove[i]]) 
    //             delete all_tree[factory.allToRemove[i]];
    //     }

    //     delete all_tree[factory.rootId]; //A changer

    //     return all_tree;
        
    // }

    return factory;

}])
})();


// (function(){
//     angular.module('app.spinal-panel')
//     .factory('displayFolderService',["ngSpinalCore",function(ngSpinalCore){


//         let factory = {};


//         factory.getFolderJson = () => {
//             return new Promise((resolve, reject) => {

//             });
//         }

        




//         return factory;

//     }])
// })();