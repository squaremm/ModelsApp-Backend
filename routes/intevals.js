var db = require('../config/connection');
var moment = require('moment');
var entityHelper = require('../lib/entityHelper');

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
        Interval.findOne({place: id}, function (err, interval) {
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
      interval.intervals = req.body.intervals;
      interval.place = id;

      let place = await Place.findOne({_id : id });
      if(place){
          let dbInterval = await Interval.findOne({place: place._id });
          //interval arleady exists let replace it
          if(dbInterval){
              await Interval.replaceOne({_id: dbInterval._id }, interval);
              res.status(200).json({message: `intervals updated for place ${place.name}`});
          }else{
              interval._id = await entityHelper.getNewId('intervalsid');
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

  //delete intervals 
  app.delete('/api/place/:id/intervals', function(req,res){
    let id  = parseInt(body.params.id);
      Interval.deleteOne({place:id},function(err,deleted){
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
    intervals.forEach((interval) => {
      let objectKeys = Object.keys(interval);
      requiredProperties.forEach(key => {
        let foundKey =  objectKeys.find(x=> x == key);
        if(foundKey){
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
    return isValid;
  }