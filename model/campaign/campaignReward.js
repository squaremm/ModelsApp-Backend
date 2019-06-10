let Schema = require('validate');

let campaignReward = new Schema({
    type: {
      type: String,
      required : true,
      enum: ['credit', 'gift'],
    },
    isGlobal: {
      type: Boolean,
      required : true
    },
    position: {
      type: Number
    },
    value: {
      type: Number
    },
    mainImage: {
      type: String
    }
});
  
module.exports = {
    campaignReward: campaignReward
}

