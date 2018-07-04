require('./visaManagerCtrl');
require('./visaManagerService');
require('./addItem');
require('./folder.directive');
require('./adminVisaManagerCtrl');
require('./adminVisaManagerService');
require('./models');
require('./displayFolderService');
require('./searchFilter');
require('./selectFilter');
require('./chart.min');
require('./chart.directive');
require('./case.progress.directive');
require('./changeDatePickerFormat');
require('./messageScroll.directive');
require('./caseFilter');


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
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/addStateTemplate.html',
          name : 'addStateTemplate.html'
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/adminVisaTemplate.html',
          name : 'adminVisaTemplate.html'
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/permissionTemplate.html',
          name : 'permissionTemplate.html'
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/selectCaseTemplate.html',
          name : 'selectCaseTemplate.html'
        },{
          uri : '../templates/spinal-env-drive-plugin-visa/commentTemplate.html',
          name : 'commentTemplate.html'
        }];


        for (var i = 0; i < toload.length; i++) {
          load_template(toload[i].uri, toload[i].name);
        }

        var plateform = /drive/.exec(window.location.pathname);


        if(plateform) {
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
        } else {
          goldenLayoutService.registerPanel({
            id: "spinal-env-drive-plugin-admin-visa",
            name: "Admin Visa",
            cfg: {
              isClosable: true,
              title: "Admin Visa",
              type: 'component',
              width: 50,
              componentName: 'SpinalHome',
              componentState: {
                template: 'adminVisaTemplate.html',
                module: 'app.spinal-visa',
                controller: 'adminVisaManagerCtrl'
              }
            }
          });
        }

        if(plateform) {
          spinalDrive_Env.add_applications('FileExplorer', new SpinalDrive_App_FileExplorer_visa());
        }

        

      }]);

})();