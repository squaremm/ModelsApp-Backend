let moment = require('moment');

exports.toMobileViewModel = (campaigns, currentUser, withDetails) => {
    let now = moment();
    return campaigns.map(x=> {
      let availableFrom = moment(x.availableFrom);
      let availableTill = moment(x.availableTill);
      if(now.isAfter(availableFrom) && now.isBefore(availableTill)){
        x.daysToStart = moment(x.startAt).diff(now, 'days') < 0 ? 0 : moment(x.startAt).diff(now, 'days');
        x.daysToPicture =  moment(x.uploadPicturesTo).diff(now, 'days') < 0 ? 0 : moment(x.uploadPicturesTo).diff(now, 'days');
        x.daysToInstagramPicture =  moment(x.uploadPicturesInstagramTo).diff(now, 'days') < 0 ? 0 : moment(x.uploadPicturesInstagramTo).diff(now, 'days');
        x.isJoinable = x.daysToStart > 0 && x.users.filter(x=> x == currentUser._id).length == 0;
        x.isParticipant = x.users.filter(x=> x == currentUser._id).length > 0;
        x.isWinner = x.winners.filter(x => x.user == currentUser._id).length > 0;
        x.hasWinner = x.winners.length > 0;
        delete x.startAt;
        delete x.uploadPicturesInstagramTo;
        delete x.uploadPicturesTo;
        delete x.availableFrom;
        delete x.availableTill;
        delete x.users;
        delete x.qrCode;
        if(!withDetails){
          delete x.rewards;
          delete x.tasks;
          delete x.description;
          delete x.isJoinable;
          delete x.isParticipant;
          delete x.isWinner;
          delete x.exampleImages;
          delete x.moodboardImages;
        }
        return x;
      }else{
        return null;
      }
    }).filter(x=>x != null);
}

//userCampaig statuses
//0 - waiting for confirmation
//1 - accepted
//-1 - rejected
//2 - waiting for review
//3 - under review
//4 - photo approved
//-2 - photo rejected
exports.getStatusDescription = async (status) => {
  switch (status){
    case 0 : return 'waiting for confirmation';
    case 1 : return 'accepted';
    case -1 : return 'rejected';
    case 2 : return 'waiting for review';
    case 3 : return 'under review';
    case 4 : return 'photo approved';
    case -2 : return 'photo rejected';
  }
}
 exports.joinCampaignWithUserCampaign = async (campaign, userCampaigns) => {
    campaign.imageCount = userCampaigns.imageCount;
    campaign.status = userCampaigns.status;
    campaign.location = userCampaigns.location;
    campaign.slot = userCampaigns.slot;
    campaign.images = userCampaigns.images;
    campaign.statusDescription = await this.getStatusDescription(userCampaigns.status);
    campaign.isPictureUploadAllow = userCampaigns.isGiftTaken && (userCampaigns.status == 1 || userCampaigns.status == -2) && moment().isBefore(moment(userCampaigns.uploadPicturesTo));
    campaign.isReadyForReview = userCampaigns.isGiftTaken && 
      (userCampaigns.status == 1 || userCampaigns.status == -2) && 
      moment().isBefore(moment(userCampaigns.uploadPicturesTo)) &&
      userCampaigns.images.length == userCampaigns.imageCount;
    campaign.isAccepted = userCampaigns.isAccepted;
    campaign.isPending = userCampaigns.isPending;
    campaign.isGiftTaken = userCampaigns.isGiftTaken;
    return campaign;
 }