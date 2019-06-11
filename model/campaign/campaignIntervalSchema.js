let Schema = require('validate');
let moment = require('moment');

let localtion = new Schema({
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    coordinates: {
        
    }
});

let CampaignSchema =  new Schema({
    localtion: {
        type: 
    }
})
