var db = require('../config/connection');
var middleware = require('../config/authMiddleware');
var moment = require('moment');
var imageUplader = require('../lib/imageUplader');
var multiparty = require('multiparty');
var pushProvider = require('../lib/pushProvider');

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

  // app.get('/api/mutate', function (req, res) {
  //   OfferPost.deleteMany({_id: {$in: [12,13,38,39,40,41,42,43,44,45,46,47,48,49,50,51]}});
  //   res.send('mutated');
  // });

  // Offers section
  // ______________________________

  // Get specific Offer
  app.get('/api/place/offer/:id', function (req, res) {
    var id = parseInt(req.params.id);

    Offer.findOne({_id: id}, async function (err, offer) {
      if (!offer) {
        res.json({message: "No such offer"});
      } else {
        if (req.query.userID) {
          var user = parseInt(req.query.userID);
          offer.posts = await OfferPost.find({user: user, offer: offer._id}).toArray();
        }
        offer.place = await Place.findOne({_id: offer.place}, {projection: {socials: 1}});
        if(offer.place.socials.instagram) {
          var insta = offer.place.socials.instagram;
          var regexp = insta.match(/instagram.com\/(.*)\/?\??/i);
          offer.instaUser = regexp[1];
        } else {
          offer.instaUser = "";
        }
        res.json(offer);
      }
    });
  });

  //Get all the booking belonging to specified place
  app.get('/api/place/:id/offer', function (req, res) {
    var id = parseInt(req.params.id);
    Offer.find({ place: id }).toArray(function (err, offers) {
      res.json(offers);
    });
  });

  app.get('/api/offer/:id/booking/:bookingId/actions', async (req, res) =>{
    var offerId = parseInt(req.params.id);
    var bookingId = parseInt(req.params.bookingId);
    if(offerId && bookingId){
      Offer.findOne({ _id: offerId })
        .then(offer => {
          if(!offer)  res.status(404).json({message: "offer not found"});
          Booking.findOne({_id: bookingId})
            .then(booking => {
              if(!booking) res.status(404).json({message: "booking not found"});
                var offerActions = booking.offerActions;
                //check if user arleady go to choose action for particular offer
                if(offerActions.filter(offerAction => offerAction.offerId == offerId).length > 0) {
                  res.status(200).json(offerActions.filter(offerAction => offerAction.offerId == offerId)[0].actions);
                }else{
                  //first apperence we need to create available actions
                  var credits = offer.credits;
                  var offerCreditsArray = Array.from(Object.keys(credits));
                  var offerAction = {
                    offerId: offerId,
                    actions: offerCreditsArray.map(x=> {
                      return {
                        displayName: getAvailableActionTypes()[x],
                        type: x,
                        credits: credits[x],
                        active: true
                      }
                    })
                  };
                  Booking.findOneAndUpdate({_id: bookingId}, { $push : { offerActions: offerAction }})
                    .then(()=>{
                    res.status(200).json(offerAction.actions);
                  })
                  .catch(err =>{
                    res.status(500).json({message: err});
                  });
                }
            })
            .catch(err => {
              res.status(404).json({message: err.message});
            });
        })
        .catch(err => {
          res.status(404).json({message: err.message});
        });

    }else{
      res.status(400).json({message: "invalid parameters"});
    }
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

  app.get('/api/offer/:id/actions', async function(req, res) {
    //var user = await req.user;
    var id = parseInt(req.params.id);

      Offer.findOne({_id: id}).then(offer => {
        var credits = offer.credits;
        var offerCreditsArray = Array.from(Object.keys(credits));

        res.json(offerCreditsArray.map(x=> {
              return {
                displayName: getAvailableActionTypes()[x],
                type: x,
                credits: credits[x],
                active: true
              }
            }))
          })
      .catch(err => {
        res.status(500).json({message: 'err'});
      });
    });

  // Create the offer. Then wait for the post, admin's check of the post, and then close it
  app.post('/api/place/:id/offer', function (req, res) {
    var id = parseInt(req.params.id);
    if (req.body.name && id && req.body.userID && req.body.price && req.body.composition && req.body.credits && req.body.photo) {
      var offer = {};
      offer.name = req.body.name;
      offer.place = id;
      offer.user = parseInt(req.body.userID);
      offer.price = parseInt(req.body.price);
      offer.creationDate = moment().format('DD-MM-YYYY');
      offer.composition = req.body.composition;
      offer.credits = req.body.credits;
      Object.keys(offer.credits).map(function (key) {
        offer.credits[key] = parseInt(offer.credits[key]);
      });
      offer.photo = req.body.photo;
      offer.post = null;
      offer.closed = false;
      offer.level = parseInt(req.body.level) || 4;
      offer.images = [];
      offer.mainImage = null;

      User.findOne({ _id: offer.user }, { projection: { credits: 1 }}, function (err, user) {
        if (!user) {
          res.json({ message: "No such user" });
        } else {
            Counter.findOneAndUpdate(
              {_id: "offerid"},
              {$inc: {seq: 1}},
              {new: true},
              function (err, seq) {
                if (err) console.log(err);
                offer._id = seq.value.seq;

                Place.findOneAndUpdate({_id: id}, {$push: {offers: seq.value.seq}}, function (err, place) {
                  if (!place.value) {
                    res.json({message: "No such place"});
                  } else {
                    User.findOneAndUpdate({_id: offer.user}, {$push: {offers: seq.value.seq}});
                    Offer.insertOne(offer);
                    
                    User.find({ accepted : true }).toArray(async (err, users) => {
                      OfferPost.distinct('user', { place: place.value._id }).then(async (posts) => {
                        let devices = [];
                        posts.forEach((post) => {
                          var user = users.find(x=>x._id == post);
                          if(user) devices.push(user.devices);
                        });
                        devices = devices.reduce((a,b) => a.concat(b));
                        await pushProvider.sendNewOfferNotification(devices, offer, place.value);
                      });
                    });

                    res.json({message: "Offer created"});
                  }
                });
              }
            );
        }
      });
    } else {
      res.json({message: "Required fields are not fulfilled"});
    }
  });

  // Deletes the offer document and all links to it
  app.delete('/api/place/offer/:id', function (req, res) {
    var id = parseInt(req.params.id);
    Offer.findOne({_id: id}, function (err, offer) {
      if (!offer) {
        res.json({message: "No such offer"});
      } else {
        Place.findOneAndUpdate({_id: parseInt(offer.place)}, {$pull: {offers: id}}, function (err, updated) {
          if (!updated.value) {
            res.json({message: "Could not be deleted"});
          } else {
            Offer.deleteOne({_id: id}, function (err, deleted) {
              if (deleted.deletedCount === 1) {
                res.json({message: "Deleted"});
              } else {
                res.json({message: "Not deleted"});
              }
            });
          }
        });
      }
    });
  });


  // Posts section
  // ____________________________

  // Get the app know if the User created a post to pay for the offer

  app.post('/api/place/:id/post/sample', function (req, res) {
    if (req.body.feedback) {
      var samplePost = {};
      samplePost.feedback = req.body.feedback;
      samplePost.place = parseInt(req.params.id);
      samplePost.updatedTime = moment().format('DD-MM-YYYY');
      samplePost.users = [];

      SamplePost.findOne({place: samplePost.place, feedback: samplePost.feedback}, function (err, post) {
        if (post) {
          res.json({message: "The sample of the post with this review already exist"});
        } else {
          Counter.findOneAndUpdate({_id: "samplepostid"}, {$inc: {seq: 1}}, {new: true}, function (err, seq) {
            if (err) console.log(err);
            samplePost._id = seq.value.seq;
            SamplePost.insertOne(samplePost);
            res.json({message: "Successfully added"});
          });
        }
      });
    }
  });

  function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
  }

  // Get all post samples by placeID and Action
  app.get('/api/place/:id/sample', middleware.isAuthorized, async function (req, res) {
    var id = parseInt(req.params.id);

    var checkSample = await SamplePost.findOne({});
    if(checkSample.updatedDate !== moment().format('DD-MM-YYYY')) {
      SamplePost.updateMany({}, { $set: { updatedDate: moment().format('DD-MM-YYYY'), users: [] }});
    }

    var user = await req.user;
    SamplePost.find({place: id, users: {$not: {$elemMatch: {$eq: user._id}}}}).toArray(async function (err, posts) {
      if (posts.length !== 0) {
        var post = await posts[randomInteger(0, posts.length - 1)];
        SamplePost.findOneAndUpdate({_id: post._id}, {$push: {users: user._id}});
        res.json({message: post.feedback});
      } else {
        res.json({message: "No samples for you"});
      }
    });
  });

  app.post('/api/place/offer/:id/post', middleware.isAuthorized, function (req, res) {

    Offer.findOne({_id: parseInt(req.params.id)}, function (err, offer) {
      if (!offer) {
        res.json({message: "No such offer"});
      } else {
        if (!req.body.postType || !req.body.link || !req.body.feedback) {
          res.json({message: "Not all fields are provided"});
        } else {
          if (!offer.credits[req.body.postType]) {
            res.json({message: "This Post type is unsupported"});
          } else {

            var offerPost = {};
            offerPost.type = req.body.postType;
            offerPost.credits = offer.credits[offerPost.type];
            offerPost.offer = parseInt(req.params.id);
            offerPost.stars = parseInt(req.body.stars) || 0;
            offerPost.creationDate = moment().format('DD-MM-YYYY');
            offerPost.link = req.body.link;
            offerPost.feedback = req.body.feedback;
            offerPost.place = offer.place;
            offerPost.accepted = false;
            offerPost.user = req.user._id;

            Counter.findOneAndUpdate(
              {_id: "offerpostid"},
              {$inc: {seq: 1}},
              {new: true},
              function (err, seq) {
                if (err) console.log(err);
                offerPost._id = seq.value.seq;

                OfferPost.insertOne(offerPost);

                Offer.findOneAndUpdate({_id: offerPost.offer}, {$set: {post: seq.value.seq}}, function (err, offer) {
                  if (!offer.value) {
                    res.json({message: "No such offer"});
                  } else {

                    Place.findOneAndUpdate({_id: offer.value.place}, {$push: {posts: seq.value.seq}});
                    User.findOneAndUpdate({_id: offerPost.user}, {$push: {offerPosts: seq.value.seq}}, function (err, user) {
                      if (!user.value) {
                        res.json({message: "Mistake in the offer"});
                      } else {
                        res.json({message: "Offer post created"});
                      }
                    });
                  }
                });
              }
            );
          }

        }
      }
    });
  });

app.post('/api/offer/:id/booking/:bookingId/post', middleware.isAuthorized, function (req, res) {
  
    var bookingId = parseInt(req.params.bookingId);
    OfferPost.findOne({ offer: parseInt(req.params.id), booking: bookingId, type: req.body.postType }, function(err, dbOfferPost){
      if(dbOfferPost){
        res.status(400).json({message: "You arleady done this action"});
      }else{

    Offer.findOne({_id: parseInt(req.params.id)}, function (err, offer) {
      if (!offer) {
        res.json({message: "No such offer"});
      } else {
        Booking.findOne({_id: bookingId}, function(err, booking){
          if(!booking){
            res.status(404).json({message: "No such booking"});
          }else{
            if (!req.body.postType || !req.body.link || !req.body.feedback) {
              res.json({message: "Not all fields are provided"});
            } else {
              if (!offer.credits[req.body.postType]) {
                res.json({message: "This Post type is unsupported"});
              } else {
    
                var offerPost = {};
                offerPost.type = req.body.postType;
                offerPost.credits = offer.credits[offerPost.type];
                offerPost.offer = parseInt(req.params.id);
                offerPost.stars = parseInt(req.body.stars) || 0;
                offerPost.creationDate = moment().format('DD-MM-YYYY');
                offerPost.link = req.body.link;
                offerPost.feedback = req.body.feedback;
                offerPost.place = offer.place;
                offerPost.accepted = false;
                offerPost.user = req.user._id;
                offerPost.booking = booking._id;

                Counter.findOneAndUpdate(
                  {_id: "offerpostid"},
                  {$inc: {seq: 1}},
                  {new: true},
                  function (err, seq) {
                    if (err) console.log(err);
                    offerPost._id = seq.value.seq;
    
                    OfferPost.insertOne(offerPost);
    
                    Offer.findOneAndUpdate({_id: offerPost.offer}, {$set: {post: seq.value.seq}}, function (err, offer) {
                      if (!offer.value) {
                        res.json({message: "No such offer"});
                      } else {
                        

                        Booking.updateOne(
                          { 'offerActions.offerId': offerPost.offer, _id : bookingId  },
                          { $set: { 'offerActions.$.actions.$[t].active': false }},
                          { arrayFilters: [ {"t.type": offerPost.type  } ] } , function(err, booking){

                            console.log(booking);
                            console.log(err);
                            Place.findOneAndUpdate({_id: offer.value.place}, {$push: {posts: seq.value.seq}});
                            User.findOneAndUpdate({_id: offerPost.user}, {$push: {offerPosts: seq.value.seq}}, function (err, user) {
                              if (!user.value) {
                                res.json({message: "Mistake in the offer"});
                              } else {
                                res.json({message: "Offer post created"});
                              }
                            });
                          });
                      }
                    });
                  }
                );
              }
            }
          }
        })
      }
    });
  }
  });
  });
  // Get all OfferPosts created today
  app.get('/api/offerPosts/today', function (req, res) {
    var today = moment().format('DD-MM-YYYY');
    OfferPost.find({creationDate: {$lte: today}}).toArray(function (err, posts) {
      res.json(posts);
    });
  });

  // Get all approved OfferPosts
  app.get('/api/offerPosts/approved', function (req, res) {
    OfferPost.find({accepted: true}).toArray(async function (err, posts) {
      var full = await Promise.all(posts.map(async function (post) {
        post.user = await User.findOne({_id: post.user}, {projection: {name: 1, surname: 1, photo: 1}});
        return post;
      }));
      res.json(full);
    });
  });

  // Get all OfferPosts
  app.get('/api/offerPosts', function (req, res) {
    OfferPost.find({}).toArray(function (err, posts) {
      res.json(posts);
    });
  });

  // Get the OfferPost with the Offer inside it
  app.get('/api/offer/post/:id', function (req, res) {
    var id = parseInt(req.params.id);
    OfferPost.findOne({_id: id}, async function (err, offerPost) {
      if (!offerPost) {
        res.json({message: "No such post"});
      } else {
        offerPost.offer = await Offer.findOne({_id: offerPost.offer});
        res.json(offerPost);
      }
    })
  });

  // Get the OfferPosts belonging to some offer
  app.get('/api/offer/:id/posts', function (req, res) {
    var id = parseInt(req.params.id);
    OfferPost.find({offer: id}).toArray(function (err, posts) {
      res.json(posts);
    });
  });
 
  //Delete image
  app.delete('/api/offer/:id/images', async (req,res) => {
    var id = parseInt(req.params.id);
    var imageId = req.body.imageId;
    if(id){
      var offer = await Offer.findOne({ _id : id });
      if(offer){
        var image = offer.images.find( x=>x.id == imageId);
        if(image){
          await imageUplader.deleteImage(image.cloudinaryId)
          .then(() => {
            Offer.findOneAndUpdate({_id: id}, { $pull: { 'images' : { 'id': image.id } }})
              .then(async () => {
                if(offer.mainImage == image.url){
                  await Offer.findOneAndUpdate({_id: id }, {$set: { mainImage:  null } })
                }
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
        res.status(404).json({message : "Image is for the wrong offer"});
      }
      }else{
        res.status(404).json({message : "offer not found"});
      }
    }else{
      res.status(404).json({message : "invalid parameters"});
    }
    
  });
   //Add new images to offer
  app.post('/api/offer/:id/images', async (req,res) => {
    var id = parseInt(req.params.id);
    if(id){
      var offer = await Offer.findOne({ _id : id });
      if(offer){
      var form = new multiparty.Form();
      form.parse(req, async function (err, fields, files) {
        files = files.images;
        for (file of files) {
          await imageUplader.uploadImage(file.path, 'offers', offer._id)
            .then(async (newImage) =>{
              await Offer.findOneAndUpdate({ _id: id }, { $push: { images: newImage } })
            })
            .catch((err) => {
              console.log(err);
            });
        }
        res.status(200).json({message: "ok"});
      });
    }else{
      res.status(404).json({message : "offer not found" });
    }
    }else{
      res.status(404).json({message : "invalid parameters"});
      }
  });
  //change main image
  app.put('/api/offer/:id/images/:imageId/main', async (req,res) => {
    var id = parseInt(req.params.id);
    var imageId = req.params.imageId;
    if(id && imageId){
      var offer = await Offer.findOne({ _id : id });
      if(offer && offer.images && offer.images.find( x=>x.id == imageId)){
        await Offer.findOneAndUpdate({ _id : id }, {$set : { 'images.$[].isMainImage': false } } );
        var image = offer.images.find( x=>x.id == imageId);
        await Offer.findOneAndUpdate({ _id : id }, 
          { $set : { mainImage : image.url, 'images.$[t].isMainImage' : true }},
          { arrayFilters: [ {"t.id": imageId  } ] }
          )
          res.status(200).json({message: "ok"});
      }else{
        res.status(404).json({message : "offer not found"});
      }
    }else{
      res.status(404).json({message : "invalid parameters"});
    }
  });

  //edit existing offer
  app.put('/api/offer/:id', async (req,res) => {
    let id = parseInt(req.params.id);
    let reqOffer = req.body.offer;
    if(id){
      var offer = await Offer.findOne({ _id : id});
      if(offer){
        Offer.replaceOne({ _id : id }, reqOffer, async (status) => {
          res.status(200).json(await Offer.findOne({ _id: id}));
        });
      }else{
        res.status(404).json({message : "offer not found"});
      }
    }else{
      res.status(404).json({message: "invalid parameters" });
    }
  });
};
