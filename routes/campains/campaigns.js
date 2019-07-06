let db = require('../../config/connection');
let campaignSchema = require('../../model/campaign/campaignSchema');
let viewModels = require('../../model/campaign/campaignViewModel');
let moment = require('moment');
let entityHelper = require('../../lib/entityHelper');
let imageUplader = require('../../lib/imageUplader');
let multiparty = require('multiparty');
let middleware = require('../../config/authMiddleware');
let crypto = require('crypto');

let Campaign, UserCampaign, User;
db.getInstance(function (p_db) {
  User = p_db.collection('users');
  Campaign = p_db.collection('campaigns');
  UserCampaign = p_db.collection('userCampaigns');
});

module.exports = function(app) {
  
  //create new campaing
  app.post('/api/admin/campaign', async (req, res) => {
    let campaign =  req.body;
    let errors = campaignSchema.campaignSchema.validate(campaign);
    if(errors.length == 0){
      let rewardValidator = await validateRewards(campaign.rewards);
      let taskValidator = await validateTasks(campaign.tasks)
      if(rewardValidator.isValid && taskValidator.isValid){
        campaign._id = await entityHelper.getNewId('campaignId');
        campaign.mainImage = null;
        campaign.qrCode = crypto.randomBytes(20).toString('hex'),
        campaign.users = [];
        campaign.exampleImages = [];
        campaign.moodboardImages = [];
        campaign.winners = [];
        await Campaign.insertOne(campaign);
      res.status(200).json(campaign);
      }else{
        res.status(400).json({message: rewardValidator.error + ' ' + taskValidator.error});
      }
    }else{
      res.status(400).json(errors.map(x=>x.message));
    }
  });
  // get raw campaigns for admin 
  app.get('/api/admin/campaign', async (req, res) => {
    let campaigns = await Campaign.find({}).toArray();
    res.status(200).json(campaigns);
  });

  app.get('/api/campaign', middleware.isAuthorized, async (req, res) => {
    let user = await req.user;
    if(user){
      let campaigns = await Campaign.find({}).toArray();
      res.status(200).json(viewModels.toMobileViewModel(campaigns, user, false));
    }else{
      res.status(400).json({message : 'not authoirze'});
    }
  });
  app.get('/api/campaign/bookings', middleware.isAuthorized, async (req,res) => {
    let user = await req.user;
    if(user){
    let userBookings = await UserCampaign
    .aggregate([
        {
            '$lookup': {
                'from': 'campaigns', 
                'localField': 'campaign', 
                'foreignField': '_id', 
                'as': 'campaign'
            }
        }, {
            '$unwind': {
                'path': '$campaign'
            }
        }, {
            '$match': {
                'isAccepted': true,
                'user': user._id
            }
        }
    ]).toArray();
    res.status(200).json(userBookings.map(x => {
      if(moment().isBefore(moment(x.campaign.availableTill))){
        let obj = {
          title : x.campaign.title,
          campaignId: x.campaign._id,
          pickUpDate: x.slot.date ? `${x.slot.date} ${x.slot.startTime}` : null,
          mainImage: x.campaign.mainImage,
          isGiftTaken: x.isGiftTaken,
          location: x.location
        }
        return obj;
      }
    }).filter(x => x != null));
    }else{
      res.status(400).json({message: "user not found"});
    }
  });

  app.get('/api/campaign/:id', middleware.isAuthorized, async (req, res) => {
    let user = await req.user;
    let id = parseInt(req.params.id);
    if(user){
      let campaigns = await Campaign.find({}).toArray();
      let campaign = viewModels.toMobileViewModel(campaigns, user, true).filter(x => x._id == id)[0];
      if(campaign){
        if(campaign.hasWinner){
          campaign.userWinner = await User.findOne({_id: campaign.winners.find(x=>x.position == 1).user });
          campaign.userWinner = {
            _id: campaign.userWinner._id,
            mainImage: campaign.userWinner.mainImage,
            instagramName: campaign.userWinner.instagramName,
          }
        }
        if(campaign.isParticipant){
          let userCampaigns = await UserCampaign.findOne({campaign : campaign._id, user : user._id });
          let viewModel = await viewModels.joinCampaignWithUserCampaign(campaign, userCampaigns);
          res.status(200).json(viewModel);
        }else{
          res.status(200).json(campaign);
        }
      }else{
        res.status(400).json({message : 'not found'});
      }
    }else{
      res.status(400).json({message : 'not authoirze'});
    }
  });
  app.get('/api/campaign/:id/photos', middleware.isAuthorized, async (req, res) => {
    let user = await req.user;
    let id = parseInt(req.params.id);
    if(user){
      let campaigns = await UserCampaign.find({campaign: id}).toArray();
      campaigns = campaigns.map(x => {
        let images = x.images.map( xx=> {
          return xx.url;
        })
        return images;
      })
      res.status(200).json(campaigns);
    }else{
      res.status(400).json({message : 'not authoirze'});
    }
  });

  app.post('/api/campaign/:id/images/main', async (req,res) => {
    var id = parseInt(req.params.id);
    if(id){
      var campaign = await Campaign.findOne({ _id : id });
      if(campaign){
      var form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        if(files){
          file = files.images[0];
          await imageUplader.uploadImage(file.path, 'campaigns', campaign._id)
            .then(async (newImage) =>{
              await Campaign.findOneAndUpdate({ _id: id }, { $set: { mainImage: newImage.url } })
            })
            .catch((err) => {
              console.log(err);
            });
          res.status(200).json({message: "ok"});
        }else{
          res.status(400).json({message : "no files added"});
        }
      });
    }else{
      res.status(404).json({message : "Campaign not found" });
    }
    }else{
    res.status(404).json({message : "invalid parameters"});
      }
  });

  //Add new images to image examples
  app.post('/api/campaign/:id/images/examples', async (req,res) => {
    var id = parseInt(req.params.id);
    if(id){
      var campaign = await Campaign.findOne({ _id : id });
      if(campaign){
      var form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        if(files){
          files = files.images;
          for (file of files) {
            await imageUplader.uploadImage(file.path, 'campaign', campaign._id)
              .then(async (newImage) =>{
                await Campaign.findOneAndUpdate({ _id: id }, { $push: { exampleImages: newImage } })
              })
              .catch((err) => {
                console.log(err);
              });
          }
          res.status(200).json({message: "ok"});
        }else{
          res.status(400).json({message : 'no files added'});
        }
      });
    }else{
      res.status(404).json({message : "campaign not found" });
    }
    }else{
      res.status(404).json({message : "invalid parameters"});
      }
  });
//Delete image from examples
app.delete('/api/campaign/:id/images/examples', async (req,res) => {
  var id = parseInt(req.params.id);
  var imageId = req.body.imageId;
  if(id){
    var campaign = await Campaign.findOne({ _id : id });
    if(campaign){
      var image = campaign.exampleImages.find( x=>x.id == imageId);
      if(image){
        await imageUplader.deleteImage(image.cloudinaryId)
        .then(() => {
          Campaign.findOneAndUpdate({_id: id}, { $pull: { 'exampleImages' : { 'id': image.id } }})
            .then(async () => {
              res.status(200).json({message: 'ok'});
            })
            .catch((err) => {
              console.log(err);
            })
        })
        .catch((err) => {
          res.status(400).json({message : err });
      });
    }else{
      res.status(404).json({message : "Image is for the wrong Campaign"});
    }
    }else{
      res.status(404).json({message : "Campaign not found"});
    }
  }else{
    res.status(404).json({message : "invalid parameters"});
  }
});
//Add new images to moodboard
app.post('/api/campaign/:id/images/moodboard', async (req,res) => {
  var id = parseInt(req.params.id);
  if(id){
    var campaign = await Campaign.findOne({ _id : id });
    if(campaign){
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
      if(files){
        files = files.images;
        for (file of files) {
          await imageUplader.uploadImage(file.path, 'campaign', campaign._id)
            .then(async (newImage) =>{
              await Campaign.findOneAndUpdate({ _id: id }, { $push: { moodboardImages: newImage } })
            })
            .catch((err) => {
              console.log(err);
            });
        }
        res.status(200).json({message: "ok"});
      }else{
        res.status(400).json({message : 'no files added'});
      }
    });
  }else{
    res.status(404).json({message : "campaign not found" });
  }
  }else{
    res.status(404).json({message : "invalid parameters"});
    }
});
//Delete image from moodboard
app.delete('/api/campaign/:id/images/moodboard', async (req,res) => {
var id = parseInt(req.params.id);
var imageId = req.body.imageId;
if(id){
  var campaign = await Campaign.findOne({ _id : id });
  if(campaign){
    var image = campaign.moodboardImages.find( x=>x.id == imageId);
    if(image){
      await imageUplader.deleteImage(image.cloudinaryId)
      .then(() => {
        Campaign.findOneAndUpdate({_id: id}, { $pull: { 'moodboardImages' : { 'id': image.id } }})
          .then(async () => {
            res.status(200).json({message: 'ok'});
          })
          .catch((err) => {
            console.log(err);
          })
      })
      .catch((err) => {
        res.status(400).json({message : err });
    });
  }else{
    res.status(404).json({message : "Image is for the wrong Campaign"});
  }
  }else{
    res.status(404).json({message : "Campaign not found"});
  }
}else{
  res.status(404).json({message : "invalid parameters"});
}
});

app.post('/api/campaign/:id/images/reward/:position', async (req,res) => {
  var id = parseInt(req.params.id);
  let position = parseInt(req.params.position);
  if(id && position){
    var campaign = await Campaign.findOne({ _id : id });
    if(campaign){
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
      if(files){
        files = files.images;
        for (file of files) {
          await imageUplader.uploadImage(file.path, 'campaign', campaign._id)
            .then(async (newImage) => {
              
              await Campaign.updateOne(
                { '_id': id },
                { $set: { 'rewards.$[t].mainImage': newImage.url }},
                { arrayFilters: [ {"t.position": position  } ] });

                res.status(200).json({message: "ok"});
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }else{
        res.status(400).json({message : 'no files added'});
      }
    });
  }else{
    res.status(404).json({message : "campaign not found" });
  }
  }else{
    res.status(404).json({message : "invalid parameters"});
    }
});

validateTasks = async(tasks) => {
  let validateObject = {
    isValid: true,
    error: ""
  }
  if(tasks && Array.isArray(tasks)){
    let photoTask = tasks.find(x=>x.type == 'photo');
    if(!photoTask){
      validateObject.isValid = false;
      validateObject.error = 'task of type photo must be set';
    }else{
      if(!photoTask.count){
        validateObject.isValid = false;
        validateObject.error = 'task of type photo must have count property';
      }
    }
  }else{
    validateObject.isValid = false;
    validateObject.error = 'tasks must be set';
  }
  return validateObject;
}

validateRewards = async(rewards) => {
  let validateObject = {
    isValid: true,
    error: ""
  }
  if(rewards && Array.isArray(rewards)){
    rewards.forEach(reward => {
      //validate isGlobal
      if(reward.isGlobal){
        if(reward.position){
          validateObject.isValid = false;
          validateObject.error = 'for global reward position is invalid';
        }
      }else{
        if(!reward.position){
          validateObject.isValid = false;
          validateObject.error = 'for non global reward position must be set';
        }
      }
      //validate credit
      if(reward.type == 'credit'){
        if(!reward.value){
          validateObject.isValid = false;
          validateObject.error = 'for credit reward value must be set';
        }
      }
      if(reward.type == 'gift'){
        if(!reward.description){
          validateObject.isValid = false;
          validateObject.error = 'for gift reward description must be set';
        }
      }
    });
  }else{
    validateObject.isValid = false;
    validateObject.error = 'rewards must be set';
  }
  return validateObject;
}
}