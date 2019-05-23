var db = require('../config/connection');
var moment = require('moment');
var entityHelper = require('../lib/entityHelper');
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

  // Get Booking Intervals for the specific place
  app.get('/api/place/:id/intervals', function (req, res) {
      var id = parseInt(req.params.id);
      Interval.findOne({place: id}, function (err, interval) {
      interval.intervals = interval.intervals.map(interval => {
        interval._id = crypto.createHash('sha1').update(`${interval.start}${interval.end}${interval.day}`).digest("hex");
        return interval;
        });
        if (!interval) {
          res.status(404).json({message: "No such intervals"});
        } else {
          res.status(200).json(interval);
        }
      })
  });

// Create the Booking Intervals entity
app.post('/api/place/:id/intervals', async function (req, res) {
  var id = parseInt(req.params.id);
  if(validateIntervals(req.body.intervals)){
    var interval = {};
    interval.place = id;

    let place = await Place.findOne({_id : id });
    if(place){
        let dbInterval = await Interval.findOne({place: place._id });
        //interval arleady exists let replace it
        if(dbInterval){
            interval.intervals = req.body.intervals.map(interval => {
              let dbSlot = dbInterval.intervals.find(x => x.start == interval.start && x.end == interval.end && x.day == interval.day);
              if(dbSlot){
                interval.offers = dbSlot.offers;
              }else{
                interval.offers = [];
              }
              return interval;
            });
            await Interval.replaceOne({_id: dbInterval._id }, interval);
            res.status(200).json({message: `intervals updated for place ${place.name}`});
        }else{
            interval._id = await entityHelper.getNewId('intervalsid');
            interval.intervals = req.body.intervals.map(interval => {
              interval.offers = [];
              return interval;
            });
            await Interval.insertOne(interval);
            res.status(200).json({message: `intervals added for place ${place.name}`});
        }
    }else{
        res.status(404).json({message: 'place not found'});
    }
  }else{
    res.status(400).json({message: "Intervals not valid: each should have start, end, slots, day: (english day of week)"})
  }
});
  app.put('/api/place/:id/intervals/:intervalId/add', async function (req, res) {
    var placeId = parseInt(req.params.id);
    var intervalId = parseInt(req.params.intervalId);
    var offerId = parseInt(req.body.offerId);
    var slotId = req.body.slotId;

    if(placeId && intervalId && offerId && slotId){
      let offer =  await Offer.findOne({_id : offerId, place : placeId });
        if(offer){
          let interval = await Interval.findOne({ _id: intervalId , place : placeId });
          if(interval){
            interval.intervals = interval.intervals.map(interval => {
              let id = crypto.createHash('sha1').update(`${interval.start}${interval.end}${interval.day}`).digest("hex");
              if(!interval.offers){
                interval.offers = [];
              }
              if(id == slotId && interval.offers.indexOf(offerId) == -1){
                interval.offers.push(offerId);
              }
              return interval;
            });
            await Interval.replaceOne({_id : intervalId }, interval);
            res.status(200).json({message : "updated", interval:  interval});
        }else{
          res.status(404).json({message :  "interval not found"});
        }
      }else{
        res.status(404).json({message : "offer not match"});
      }
    }else{
      res.status(400).json({message : "invalid parameters: placeId, intervalId, offerId, slotId"});
    }
  });

  app.put('/api/place/:id/intervals/:intervalId/remove', async function (req, res) {
    var placeId = parseInt(req.params.id);
    var intervalId = parseInt(req.params.intervalId);
    var offerId = parseInt(req.body.offerId);
    var slotId = req.body.slotId;

    if(placeId && intervalId && offerId && slotId){
          let interval = await Interval.findOne({ _id: intervalId , place : placeId });
          if(interval){
            interval.intervals = interval.intervals.map(interval => {
              let id = crypto.createHash('sha1').update(`${interval.start}${interval.end}${interval.day}`).digest("hex");
              if(id == slotId && interval.offers.indexOf(offerId) > -1){
                interval.offers.splice(interval.offers.indexOf(offerId),1);
              }
              return interval;
            });
            await Interval.replaceOne({_id : intervalId }, interval);
            res.status(200).json({message : "updated", interval:  interval});
        }else{
          res.status(404).json({message : "interval not found"});
        }
    }else{
      res.status(400).json({message : "invalid parameters: placeId, intervalId, offerId, slotId"});
    }
  });

  //delete intervals 
  app.delete('/api/place/:id/intervals', function(req, res){
    let id  = parseInt(req.params.id);
      Interval.deleteOne({place: id},function(err, deleted){
        if(err) {
            res.status(500).json({message:"Not deleted"});
        }else{
          res.status(200).json({message:"deleted"});
        }
      })
  });
}

validateIntervals = (intervals) => {
    let requiredProperties = ['start', 'end', 'day', 'slots'];
    let availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    let isValid = true;
    if(intervals && Array.isArray(intervals)){
      intervals.forEach((interval) => {
        let objectKeys = Object.keys(interval);
        requiredProperties.forEach(key => {
          let foundKey =  objectKeys.find(x=> x == key);
          if(foundKey){
            if(foundKey == 'start'){
              if(moment(`2019-01-01 ${interval.start.replace('.',':')}`).isValid()){
                interval.start = moment(`2019-01-01 ${interval.start.replace('.',':')}`).format('HH.mm');
              }else{
                isValid = false;
              }
            }
            if(foundKey == 'end'){
              if(moment(`2019-01-01 ${interval.end.replace('.',':')}`).isValid()){
                interval.end = moment(`2019-01-01 ${interval.end.replace('.',':')}`).format('HH.mm');
              }else{
                isValid = false;
              }
            }
            if(foundKey == 'day'){
              if(!availableDays.find(x=> x == interval[foundKey])){
                isValid = false;
              }
            }
          }else{
            isValid = false;
          }
        });
        interval.slots = parseInt(interval.slots);
      });
    }else{
      isValid = false;
    }
    
    return isValid;
  }