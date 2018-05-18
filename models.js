
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

    constructor(message,state_id,myList) {
        super();
        var x = new Lst();
        if(myList) {
            for (var i = 0; i < myList.length; i++) {
                var obj = new validModel(myList[i]);
                x.push(obj);
            }
        }
        
        this.add_attr({
            info : {
                message : message,
                state_id : state_id
            },
            validation : x,
            isValid : false
        });
    }
};

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