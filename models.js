

var VisaModel = class VisaModel extends Model {
    constructor(message,state_id) {
        super();
        this.add_attr({
            info : {
                message : message,
                state_id : state_id
            },
            validation : new Lst()
        });
    }
};

module.exports.VisaModel = VisaModel;