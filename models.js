

var VisaModel = class VisaModel extends Model {

    constructor(message,state_id,myList) {
        super();
        var x = new Lst();
        if(myList) {
            for (var i = 0; i < myList.length; i++) {
                var obj = {name : myList[i],valid : new Bool(false)};
                x.push(obj);
            }
        }
        
        this.add_attr({
            info : {
                message : message,
                state_id : state_id
            },
            validation : x
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