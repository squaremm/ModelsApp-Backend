let Schema = require('validate');
let moment = require('moment');

let validateTime = (time) => {
   return moment(`2019-01-01 ${time.replace('.',':')}`).isValid();
};

let interval = new Schema({
    start:{
        type: String,
        use: { validateTime },
        required : true
    },
    end:{
        type: String,
        use: { validateTime },
        required : true
    },
    slots:{
        type: Number,
        required : true
    },
    day:{
        type: String,
        required : true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
});
let coordinate = new Schema({
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    }
})

let location = new Schema({
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    coordinates: coordinate
});

let campaignIntervalSchema =  new Schema({
    location: location,
    intervals: [interval]
})

module.exports = {
    campaignIntervalSchema: campaignIntervalSchema
}
