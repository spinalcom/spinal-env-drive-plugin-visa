
require('./visaManagerCtrl');
require('./visaManagerService');
require('./addItem');


(function () {
  angular.module('app.spinal-panel')
    .run(["$templateCache", "$http", "goldenLayoutService",
      function ($templateCache, $http, goldenLayoutService) {
        let load_template = (uri, name) => {
          $http.get(uri).then((response) => {
            $templateCache.put(name, response.data);
          }, (errorResponse) => {
            console.log('Cannot load the file ' + uri);
          });
        };

        let toload = [{
          uri: '../templates/spinal-env-drive-plugin-visa/visaTemplate.html',
          name: 'visaTemplate.html'
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/addItemTemplate.html',
          name : 'addItemTemplate.html'
        }];


        for (var i = 0; i < toload.length; i++) {
          load_template(toload[i].uri, toload[i].name);
        }

        goldenLayoutService.registerPanel({
          id: "spinal-env-drive-plugin-visa",
          name: "Visa Profil",
          cfg: {
            isClosable: true,
            title: "Visa Profil",
            type: 'component',
            width: 50,
            componentName: 'SpinalHome',
            componentState: {
              template: 'visaTemplate.html',
              module: 'app.spinal-visa',
              controller: 'visaManagerCtrl'
            }
          }
        });

        spinalDrive_Env.add_applications('FileExplorer', new SpinalDrive_App_FileExplorer_visa());

        

      }]);

})();