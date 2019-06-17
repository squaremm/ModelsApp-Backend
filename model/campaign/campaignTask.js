let Schema = require('validate');

let campaignTask = new Schema({
    type: {
      type: String,
      required : true,
      enum: ['story', 'post', 'photo']
    },
    description : {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
});

module.exports = {
    campaignTask: campaignTask
}

