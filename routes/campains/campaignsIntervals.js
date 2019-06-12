var db = require('../../config/connection');
let campaignIntervalSchema = require('../../model/campaign/campaignIntervalSchema');
let viewModels = require('../../model/campaign/campaignViewModel');
let moment = require('moment');
let entityHelper = require('../../lib/entityHelper');
let imageUplader = require('../../lib/imageUplader');
let multiparty = require('multiparty');
let middleware = require('../../config/authMiddleware');
let pushProvider = require('../../lib/pushProvider');

let Campaign, CampaignInterval;
db.getInstance(function (p_db) {
  Campaign = p_db.collection('campaigns');
  CampaignInterval = p_db.collection("campaignIntervals");
});

module.exports = function(app) {
    app.post('/api/campaign/:id/interval', async (req, res) => {
        let interval = req.body;
        let id = parseInt(req.params.id);
        if(interval && id){
            let campaign = await Campaign.findOne({_id: id});
            if(campaign){
                let errors = campaignIntervalSchema.campaignSchema.validate(interval);
                if(errors.length == 0){
                    if(interval.intervals){
                        interval._id = await entityHelper.getNewId('campaignIntervalId');
                        interval.campaign = campaign._id;

                        await CampaignInterval.insertOne(interval);
                        res.status(200).json(interval);
                    }else{
                      res.status(400).json({message: 'intervals are not defined'});
                    }
                  }else{
                    res.status(400).json(errors.map(x=>x.message));
                  }
            }else{
                res.status(404).json({message : "campaign not found"});
            }
        }else{
            res.status(404).json({message : "invalid parameters"});
        }
    });
}