var db = require('../../config/connection');
let viewModels = require('../../model/campaign/campaignViewModel');
let moment = require('moment');
let entityHelper = require('../../lib/entityHelper');
let imageUplader = require('../../lib/imageUplader');
let multiparty = require('multiparty');
let middleware = require('../../config/authMiddleware');
let pushProvider = require('../../lib/pushProvider');

let Campaign, UserCampaign, User;
db.getInstance(function (p_db) {
  Campaign = p_db.collection('campaigns');
  UserCampaign = p_db.collection('userCampaigns');
  User = p_db.collection('users');
});

//userCampaig statuses
//0 - waiting for confirmation
//1 - accepted
//-1 - rejected
//2 - waiting for review
//3 - under review
//4 - photo approved
//-2 - photo rejected

module.exports = function(app) {
  
    //create new user campaing
    app.post('/api/campaign/:id/join', middleware.isAuthorized,  async (req, res) => {
        let user = await req.user;
        let id = parseInt(req.params.id);
        if(user && id){
            let campaign = await Campaign.findOne({_id: id});
            if(campaign){
                if(campaign.users.filter(x => x == user._id).length == 0){
                  if(moment().isBefore(moment(campaign.startAt))){
                    let imageCount = 0;
                    if(campaign.tasks.filter(x => x.type == 'photo').length == 1){
                        imageCount = campaign.tasks.find(x => x.type == 'photo').count;
                    }
                    let userCampaign = {
                        _id: await entityHelper.getNewId('userCampaignId'),
                        user: user._id,
                        campaign: campaign._id,
                        isAccepted: false,
                        isPending: true,
                        uploadPicturesTo: campaign.uploadPicturesTo,
                        uploadPicturesInstagramTo: campaign.uploadPicturesInstagramTo,
                        imageCount: imageCount,
                        status: 0,
                        location: {},
                        slot: {},
                        images: []
                    }
                    await UserCampaign.insertOne(userCampaign);
                    await Campaign.findOneAndUpdate({_id : campaign._id},{ $push: { users: user._id }});
                    
                    let campaigns = await Campaign.find({}).toArray();
                    campaign = viewModels.toMobileViewModel(campaigns, user, true).filter(x => x._id == id)[0];

                    res.status(200).json(await viewModels.joinCampaignWithUserCampaign(campaign, userCampaign));
                  }else{
                    res.status(404).json({message : "campain arleady started"});
                }
                }else{
                    res.status(404).json({message : "you are arleady joinded"});
                }
            }else{
                res.status(404).json({message : "campaign not found"});
            }
        }else{
            res.status(404).json({message : "invalid parameters"});
        }
    });

    app.post('/api/campaign/:id/review', middleware.isAuthorized,  async (req, res) => {
      let user = await req.user;
      let id = parseInt(req.params.id);
      if(user && id){
        let userCampaign = await UserCampaign.findOne({campaign: id, user: user._id });
        if(userCampaign){
          if(userCampaign.status == 1 || userCampaign.status == -2){
            if(userCampaign.images.length == userCampaign.imageCount){
              await UserCampaign.findOneAndUpdate({campaign: id, user: user._id }, {$set : { status: 2 }});
              res.status(200).json({message : 'ok'});
            }else{
              res.status(400).json({message : `There is ${ userCampaign.imageCount - userCampaign.images.length} photos missing`});
            }
          }else{
            res.status(400).json({message : "wrong status"});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });


    app.delete('/api/campaign/:id/images', middleware.isAuthorized, async (req,res) => {
      var id = parseInt(req.params.id);
      let user = await req.user;
      var imageId = req.body.imageId || req.query.imageId;
      if(id && user && imageId){
        var userCampaign = await UserCampaign.findOne({ campaign : id, user: user._id });
        if(userCampaign){
          var image = userCampaign.images.find( x=>x.id == imageId);
          if(image){
            await imageUplader.deleteImage(image.cloudinaryId);
            await UserCampaign.findOneAndUpdate({ campaign : id, user: user._id }, { $pull: { 'images' : { 'id': image.id } }});
            res.status(200).json({message: 'ok'});
        }else{
          res.status(404).json({message : "Image is for the wrong user"});
        }
        }else{
          res.status(404).json({message : "UserCampaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });
    app.post('/api/campaign/:id/images', middleware.isAuthorized,  async (req,res) => {
      var id = parseInt(req.params.id);
      let user = await req.user;
      if(id && user){
        var userCampaign = await UserCampaign.findOne({ campaign : id, user: user._id });
        if(userCampaign){
        var form = new multiparty.Form();
        form.parse(req, async function (err, fields, files) {
          if(files){
            files = files.images;
            var addedImages = [];
            for (file of files) {
              userCampaign = await UserCampaign.findOne({ campaign : id, user: user._id });

              if(userCampaign.images.length < userCampaign.imageCount){
                await imageUplader.uploadImage(file.path, 'users', user._id)
                .then(async (newImage) =>{
                  await UserCampaign.findOneAndUpdate({ campaign : id, user: user._id }, { $push: { images: newImage } })
                  addedImages.push(newImage);
                })
                .catch((err) => {
                  console.log(err);
                });
              }
            }
            res.status(200).json({message: "ok", images: addedImages});
          }else{
            res.status(400).json({message:  'no files added'});
          }
        });
      }else{
        res.status(404).json({message : "UserCampaign not found" });
      }
      }else{
        res.status(404).json({message : "invalid parameters"});
        }
    });


    app.put('/api/admin/usercampaign/acceptpending', async (req, res) => {
      let userCampaignId = parseInt(req.body.userCampaignId);
      if(userCampaignId){
        let pendingCampaigns = await getPendingUserCampaigns();
        let userCampaign = pendingCampaigns.find(x => x._id == userCampaignId);
        if(userCampaign){
          if(userCampaign.isPending){
            await UserCampaign.findOneAndUpdate({_id : userCampaign._id }, { $set: { isPending : false , isAccepted : true, status: 1 } });
            await pushProvider.sendCampaignAcceptedNotification(userCampaign, true);
            res.status(200).json({message: "user campaign has been accepted"});
          }else{
            res.status(404).json({message : `user campaign was processed before to ${ userCampaign.isAccepted ? 'accepted' : 'rejected' }`});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });
    app.put('/api/admin/usercampaign/rejectpending', async (req, res) => {
      let userCampaignId = parseInt(req.body.userCampaignId);
      if(userCampaignId){
        let pendingCampaigns = await getPendingUserCampaigns();
        let userCampaign = pendingCampaigns.find(x => x._id == userCampaignId);
        if(userCampaign){
          if(userCampaign.isPending){
            await UserCampaign.findOneAndUpdate({_id : userCampaign._id }, { $set: { isPending : false , isAccepted : false, status: -1 } });
            await pushProvider.sendCampaignAcceptedNotification(userCampaign, false);
            res.status(200).json({message: "user campaign has been accepted"});
          }else{
            res.status(404).json({message : `user campaign was processed before to ${ userCampaign.isAccepted ? 'accepted' : 'rejected' }`});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });


    app.put('/api/admin/usercampaign/acceptphotos', async (req, res) => {
      let userCampaignId = parseInt(req.body.userCampaignId);
      if(userCampaignId){
        let underReview = await getUserCampaignsByStatus(3);
        let userCampaign = underReview.find(x => x._id == userCampaignId);
        let campaign = await Campaign.findOne({ _id :  userCampaign.campaign });
        if(userCampaign && campaign){
          if(userCampaign.status == 3){
            let creditValue = campaign.rewards.find(x => x.isGlobal && x.type == 'credit');
            if(creditValue){
              await UserCampaign.findOneAndUpdate({_id : userCampaign._id }, { $set: { status: 4 } });
              await User.findOneAndUpdate({_id : userCampaign.userId }, {$inc: {credits : creditValue.value }});
              let user = User.findOne({_id: userCampaign.userId });
              await pushProvider.creditAddNotification(user.devices, creditValue);
              res.status(200).json({message: "user campaign has been accepted"});
            }else{
              res.status(404).json({message : 'reward not defined'});
            }
          }else{
            res.status(404).json({message : `invalid status should be under review`});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });

    app.put('/api/admin/usercampaign/rejectphotos', async (req, res) => {
      let userCampaignId = parseInt(req.body.userCampaignId);
      if(userCampaignId){
        let underReview = await getUserCampaignsByStatus(3);
        let userCampaign = underReview.find(x => x._id == userCampaignId);
        if(userCampaign){
          if(userCampaign.status == 3){
            await UserCampaign.findOneAndUpdate({_id : userCampaign._id }, { $set: { status: -2 } });
            await pushProvider.sendCampaignRejectedPhotosNotification(userCampaign);
            res.status(200).json({message: "user campaign has been accepted"});
          }else{
            res.status(404).json({message : `invalid status should be under review`});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });

    app.get('/api/admin/usercampaign/pending', async (req, res) => {
        let pendingUserCampaigns = await getPendingUserCampaigns();
        res.status(200).json(pendingUserCampaigns.map(x=> {
          x.userId = x.user._id;
          x.userImage = x.user.mainImage;
          x.userEmail = x.user.email;
          delete x.user;
          delete x.uploadPicturesTo;
          delete x.uploadPicturesInstagramTo;
          delete x.imageCount;
          delete x.images;
          return x;
        }));
    });
    app.get('/api/admin/usercampaign/waiting', async (req, res) => {
      let users = await getUserCampaignsByStatus(2);
      res.status(200).json(users);
    });

    app.put('/api/admin/usercampaign/:id/review', async (req, res) => {
      let id = parseInt(req.params.id);
      if(id){
        let userCampaign = await UserCampaign.findOne({_id: id });
        if(userCampaign){
          if(userCampaign.status == 2){
            await UserCampaign.findOneAndUpdate({_id : userCampaign._id }, { $set: { status: 3 } });
            res.status(200).json({message: "ok" });
          }else{
            res.status(400).json({message : "invalid status"});
          }
        }else{
          res.status(404).json({message : "user campaign not found"});
        }
      }else{
        res.status(404).json({message : "invalid parameters"});
      }
    });

    app.get('/api/admin/usercampaign/review', async (req, res) => {
      let users = await getUserCampaignsByStatus(3);
      res.status(200).json(users);
    });

    getUserCampaignsByStatus = async (status) => {
      let userByStatus = await UserCampaign
      .aggregate([{
                '$lookup': {
                  'from': 'users', 
                  'localField': 'user', 
                  'foreignField': '_id', 
                  'as': 'user'
                }
              }, {
                '$unwind': {
                  'path': '$user'
                }
              }, 
              {
                '$match': {
                  'status': status
                }
              }]).toArray();
      return userByStatus.map(x=> {
        x.userId = x.user._id;
        x.userImage = x.user.mainImage;
        x.userEmail = x.user.email;
        delete x.user;
        delete x.uploadPicturesTo;
        delete x.uploadPicturesInstagramTo;
        return x;
      });
    };
    getPendingUserCampaigns = async () =>{
     return await UserCampaign
      .aggregate([{
                '$lookup': {
                  'from': 'users', 
                  'localField': 'user', 
                  'foreignField': '_id', 
                  'as': 'user'
                }
              }, {
                '$unwind': {
                  'path': '$user'
                }
              }, 
              {
                '$match': {
                  'isPending': true
                }
              }]).toArray();
    };
}