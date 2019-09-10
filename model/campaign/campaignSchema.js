let campaignTask = require('./campaignTask');
let campaignReward = require('./campaignReward');
let Schema = require('validate');
let moment = require('moment');

const validateDate = (date) => {
    return moment(date).isValid();
  }

let CampaignSchema =  new Schema({
    title: {
      type : String,
      required : true
    },
    type: {
      type: String,
      required : true,
      enum: ['gifting', 'influencer']
    },
    mainImage : {
      type: String
    },
    description: {
      type : String,
      required : true
    },
    imageExamples : {
      type: Array
    },
    tasks: {
        type: Array,
        required: true
    },
    tasks: [campaignTask.campaignTask],
    availableFrom: {
      type: String,
      use: { validateDate },
      required : true
    },
    availableTill: {
      type: String,
      use: { validateDate },
      required : true
    },
    startAt : {
      type: String,
      use: { validateDate },
      required : true
    },
    uploadPicturesTo: {
      type: String,
      use: { validateDate },
      required : true
    },
    uploadPicturesInstagramTo: {
      type: String,
      use: { validateDate },
      required : true
    },
    credits: {
      type: Number,
      required: true
    },
    maxParticipantsCount: {
      type: Number,
      required: true
    },
    rewards: {
      type: Array,
      required : true
    },
    rewards: [ campaignReward.campaignReward ]
});

module.exports = {
    campaignSchema: CampaignSchema
}

