var db = require('../config/connection');
var middleware = require('../config/authMiddleware');

var User, Place, Offer, OfferPost, Booking;
db.getInstance(function (p_db) {
  User = p_db.collection('users');
  Place = p_db.collection('places');
  Offer = p_db.collection('offers');
  OfferPost = p_db.collection('offerPosts');
  Booking = p_db.collection('bookings');
});

module.exports = function(app) {

  app.put(['/api/admin/acceptModel/:id', '/api/admin/rejectModel/:id'], middleware.isAdmin, function (req, res) {

    var accept = req.url !== ('/api/admin/rejectModel/' + req.params.id);
    var id = parseInt(req.params.id);
    var level = parseInt(req.body.level) || 0;

    User.findOneAndUpdate({ _id: id }, { $set: { accepted: accept, level: level }}, function (err, updated) {
      if(err) res.json({ message: "error" });
      if(updated.value !== undefined && updated.value !== null){
        if(accept){
          res.json({ message: "The model has been accepted" });
        } else{
          res.json({ message: "The model has been rejected" });
        }
      } else{
        res.json({ message: "No such user" });
      }
    });
  });


  // Constant payments or penalties for models which
  // level differs from the offer's level
  const levelDiffBooking = [
    [0, -50, -100, -150, -200],
    [0, 0, -50, -100, -150],
    [0, 0, 0, -50, -100],
    [30, 30, 30, 0, -50],
    [40, 40, 40, 40, 0]
  ];
  const levelDiffReviews = [
    30, 40, 60, 70, 100
  ];

  // Accept the model's post to deal with her offer
  app.put('/api/admin/acceptOfferPost/:id', middleware.isAdmin, function (req, res) {
    var id = parseInt(req.params.id);

    OfferPost.findOne({ _id: id }, function (err, offerPost) {
      if(err) res.json({ message: "error" });
      if(!offerPost){
        res.json({ message: "No such offer post" });
      } else {
        Offer.findOne({ _id: offerPost.offer }, function (err, offer) {
          if(!offer){
            res.json({ message: "No such Offer" });
          } else {
            // Everything is just for calculating how should user's credits change in order
            // to offer-user-level system.
            // levelDiffReviews[user.level] + levelDiffBooking - book.payed =+ user.credits

            Booking.findOne({ offer: offer._id }, function (err, book) {
              if(!book) {
                res.json({ message: "Booking for the offer not found" });
              } else {
                User.findOne({ _id: offerPost.user }, function (err, user) {
                  if(!user.level) {
                    res.json({ message: "User has no level" });
                  } else {
                    var payment = levelDiffReviews[user.level - 1] + levelDiffBooking[user.level - 1][offer.level - 1] - book.payed;

                    User.findOneAndUpdate({ _id: offerPost.user }, { $inc: { credits: payment }});
                    Offer.findOneAndUpdate({ _id: offerPost.offer }, { $set: { closed: true }});
                    OfferPost.findOneAndUpdate({ _id: id }, { $set: { accepted: true }});

                    res.json({ message: "The offer has been accepted" });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  // Reject the Offer Post without difficulties
  app.put('/api/admin/rejectOfferPost/:id', middleware.isAdmin, function (req, res) {
    var id = parseInt(req.params.id);

    OfferPost.findOneAndUpdate({ _id: id }, { $set: { accepted: false }}, function (err, updated) {
      if(err) res.json({ message: "error" });
      if(!updated.value){
        res.json({ message: "No such offer" });
      } else{
        res.json({ message: "The offer has been rejected" });
      }
    });
  });

  app.put('/api/admin/rankModel/:id', middleware.isAdmin, function (req, res) {
    var id = parseInt(req.params.id);
    var level = parseInt(req.body.level);

    if(level >= 0 && level <= 5){
      User.findOneAndUpdate({ _id: id}, { $set: { level: level }}, function (err, updated) {
        if(err) res.json({ message: "Error" });
        if(updated.value !== undefined && updated.value !== null){
          res.json({ message: "The level is updated" });
        } else{
          res.json({ message: "No such user" });
        }
      });
    } else {
      res.json({ message: "Level is out of range" });
    }
  });

  app.put('/api/admin/rankPlace/:id', middleware.isAdmin, function (req, res) {
    var id = parseInt(req.params.id);
    var level = parseInt(req.body.level);

    if(level >= 0 && level <= 5){
      Place.findOneAndUpdate({ _id: id }, { $set: { level: level }}, function (err, updated) {
        if(err) res.json({ message: "Error" });
        if(updated.value !== undefined && updated.value !== null){
          res.json({ message: "The level is updated" });
        } else{
          res.json({ message: "No such place" });
        }
      });
    } else {
      res.json({ message: "Level is out of range" });
    }
  });
};
