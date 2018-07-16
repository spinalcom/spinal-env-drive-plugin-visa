

/****
 * 
 * Model d'une case à cocher (ajouter à un fichier)
 * 
 */
var validModel = class validModel extends Model {
    constructor(id,name,users,canBeChecked) {
        super();
        this.add_attr({
            id : id,
            name : name,
            canBeChecked: canBeChecked,
            valid : !canBeChecked ? 1 : -1,
            users : users
        })
    }
}
module.exports.validModel = validModel;


/****
 * 
 * Model pour ajouter un les infos sur un fichier
 * 
 */
var VisaModel = class VisaModel extends Model {

    constructor(message,state_id,myList,path,date,validateBefore) {
        super();
        var x = new Lst();
        if(myList) {
            for (var i = 0; i < myList.length; i++) {
                var obj = new validModel(myList[i].id,myList[i].name,myList[i].users,myList[i].canBeChecked);
                x.push(obj);
            }
        }
        
        this.add_attr({
            state_id : state_id,
            message : message,
            validation : x,
            path : path,
            date : date,
            isValid : 0,
            validate_before : validateBefore
        });
    }
}
module.exports.VisaModel = VisaModel;


/****
 * 
 * Model ajouté à __visa__ pour definir la liste de toutes les cases
 * 
 */
var VisaStateModel = class VisaStateModel extends Model {
    

    constructor(name,validation) {
        super();
        

        this.add_attr({
            name : name,
            validation : []
        })
    }
}
module.exports.VisaStateModel = VisaStateModel;



/****
 * 
 * Model pour savoir si dossier a un sous dossier
 * 
 */
var SubVisaModel = class  SubVisaModel extends Model {
    constructor(name,id) {
        super();
        this.add_attr({
            name : name,
            id : id
        })
    }
}
module.exports.SubVisaModel = SubVisaModel;



/****
 * 
 * Model d'une case à cocher (ajouter à __visa__)
 * 
 */
var CaseValidation = class CaseValidation extends Model {
    constructor(id) {
        super();
        this.add_attr({
            id : id,
            name : "",
            description : "",
            users : new Lst()
        })
    }
}
module.exports.CaseValidation = CaseValidation;



/****
 * Model Message
 */
var MessageModel = class MessageModel extends Model {
    constructor(id,content,user,date) {
        super();
        this.add_attr({
            id : id,
            content : content,
            user : user,
            date : date
        })
    }
}
module.exports.MessageModel = MessageModel;



/****
 * 
 * Tabs Model
 * 
 */
var TabsModel = class TabsModel extends Model {

    constructor(argTitle) {
        super();
        this.add_attr({
            title : argTitle,
            users : [{id : 168, name : "admin"}]
        })
    }

}
module.exports.TabsModel = TabsModel;


/****
 * Model Paramaters
 */

 var ParameterModel = class ParameterModel extends Model {

    constructor() {
        super();
        this.add_attr({
            listCaseValidation : new Lst(),
            tabs : [
                new TabsModel("file list"),
                new TabsModel("folder organization"),
                new TabsModel("validation item"),
                new TabsModel("graph")
            ]
        })
    }

 }
 module.exports.ParameterModel = ParameterModel;