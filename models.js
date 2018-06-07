
var validModel = class validModel extends Model {
    constructor(name) {
        super();
        this.add_attr({
            name : name,
            valid : false
        })
    }
}

module.exports.validModel = validModel;

var VisaModel = class VisaModel extends Model {

    constructor(message,state_id,myList,path,date) {
        super();
        var x = new Lst();
        if(myList) {
            for (var i = 0; i < myList.length; i++) {
                var obj = new validModel(myList[i]);
                x.push(obj);
            }
        }
        
        this.add_attr({
            state_id : state_id,
            message : message,
            validation : x,
            path : path,
            date : date,
            isValid : 0
        });
    }
}

module.exports.VisaModel = VisaModel;



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