var db = require('../config/connection');
var crypto = require('crypto');

var User, Place, Offer, Counter, Booking, OfferPost, Interval, SamplePost;
db.getInstance(function (p_db) {
  User = p_db.collection('users');
  Place = p_db.collection('places');
  Offer = p_db.collection('offers');
  Counter = p_db.collection('counters');
  Booking = p_db.collection('bookings');
  OfferPost = p_db.collection('offerPosts');
  Interval = p_db.collection('bookingIntervals');
  SamplePost = p_db.collection('sampleposts');
});

module.exports = function(app) {

    app.post('/api/config/rewriteoffers', async (req, res) => {
        let allOffers = await Offer.find({}).toArray();
        allOffers.forEach(async offer => {
            var credits = offer.credits;
            var offerCreditsArray = Array.from(Object.keys(credits)).map(x=> {
                return {
                    id: crypto.randomBytes(10).toString('hex'),
                    displayName: getAvailableActionTypes()[x],
                    type: x,
                    credits: credits[x],
                    imageUrl: null,
                    isPictureRequired: false,
                    maxAttempts: 1,
                    parentId: null,
                    attempts: 0
                }
              });
            let parentId = crypto.randomBytes(10).toString('hex')
            offerCreditsArray.push({
                id: parentId,
                displayName: 'Send picture',
                type: 'picture',
                credits: 50,
                imageUrl: null,
                subActions: [
                    {
                        id: crypto.randomBytes(10).toString('hex'),
                        displayName: 'FoodPic',
                        type: 'foodPic',
                        imageUrl: null,
                        isPictureRequired: true,
                        maxAttempts: 999,
                        parentId: parentId,
                        attempts: 0
                    },
                    {
                        id: crypto.randomBytes(10).toString('hex'),
                        displayName: 'Atmosphere',
                        type: 'atmosphere',
                        imageUrl: null,
                        isPictureRequired: true,
                        maxAttempts: 999,
                        parentId: parentId,
                        attempts: 0
                    },
                    {
                        id: crypto.randomBytes(10).toString('hex'),
                        displayName: 'Model in venue',
                        type: 'model',
                        imageUrl: null,
                        isPictureRequired: true,
                        maxAttempts: 999,
                        parentId: parentId,
                        attempts: 0
                    },
                    {
                        id: crypto.randomBytes(10).toString('hex'),
                        displayName: 'Still life',
                        type: 'stillLife',
                        imageUrl: null,
                        isPictureRequired: true,
                        maxAttempts: 999,
                        parentId: parentId,
                        attempts: 0
                    }
                ]
            });
            await Offer.findOneAndUpdate({_id: offer._id}, { $set: {actions: offerCreditsArray} });
        });
        res.status(200).json({message: 'ok'});
    });
    function getAvailableActionTypes(){
        var availableTypes = { 
          'instaStories' : 'Instagram story',
          'instaPost': 'Instagram post',
          'fbPost': 'Facebook post',
          'tripAdvisorPost': 'Tripadvisor',
          'yelpPost': 'Yelp review',
          'gPost': 'Google post'
        }
        return availableTypes;
      }
}