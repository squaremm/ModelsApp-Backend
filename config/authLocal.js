var Strategy = require('passport-local').Strategy;
var db = require('./connection');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var pushProvider = require('../lib/pushProvider');
var entityHelper = require('../lib/entityHelper');

var Counter, Place;
db.getInstance(function (p_db) {
  Place = p_db.collection('places');
  Counter = p_db.collection('counters');
  User = p_db.collection('user');
  Interval = p_db.collection('bookingIntervals');
});

module.exports = function (passport) {
  passport.use('local-signup', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      var body = req.body;

      Place.findOne({ "client.email": body.email.toLowerCase() }, function (err, user) {
        if (err) return done(err);

        if (user) {
          req.authMessage = "User with email '" + body.email.toLowerCase() + "' already exists";
          return done(null, false);
        } else {
          if (body.confirmPassword === body.password) {
            if (body.name && body.address && body.phone && body.type && body.coordinates) {
              if (body.coordinates[0] && body.coordinates[1]) {
                Counter.findOneAndUpdate({ _id: "placeid" }, { $inc: { seq: 1 } }, { new: true }, function (err, seq) {
                  if (err) return done(err);

                  var newPlace = {
                    _id: seq.value.seq,
                    name: body.name,
                    type: body.type,
                    address: body.address,
                    description: "",
                    client: {
                      email: body.email.toLowerCase(),
                      password: bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null),
                      phone: body.phone
                    },
                    photos: [],
                    location: {
                      type: "Point",
                      coordinates: [parseFloat(body.coordinates[0]), parseFloat(body.coordinates[1])]
                    },
                    socials: {
                      facebook: "",
                      tripAdvisor: "",
                      google: "",
                      yelp: "",
                      instagram: ""
                    },
                    level: null,
                    schedule: {},
                    slots: body.slots || null,
                    creationDate: moment().format('DD-MM-YYYY'),
                    credits: 0,
                    bookings: [],
                    offers: [],
                    posts: [],
                    notificationRecivers: [],
                    images: [],
                    mainImage: null,
                    instapage: null,
                    daysOffs: [],
                    isActive: true
                  };
                  console.log(newPlace)
                  Place.insertOne(newPlace);
                  entityHelper.getNewId('intervalsid').then((id) => {
                    let interval = {
                      _id: id,
                      place: seq.value.seq,
                      intervals: []
                    }
                    Interval.insertOne(interval);
                    User.find({ accepted : true }).toArray(async (err, list) => {
                      let devices = list.map(x=> x.devices).reduce((a,b) => a.concat(b));
                      await pushProvider.sendNewPlaceNotification(devices, newPlace); 
                    }); 
                    return done(null, newPlace);
                  });
                });
              } else {
                req.authMessage = "Please, provide the coordinates";
                return done(null, false);
              }
            } else {
              req.authMessage = "Please, provide the name, address, phone or type of the place";
              return done(null, false);
            }
          } else {
            req.authMessage = "Password is not confirmed";
            return done(null, false);
          }
        }
      });
    })
  );

  passport.use('local-login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      var body = req.body;
      Place.findOne({ 'client.email': body.email.toLowerCase() }, function (err, user) {
        if (err) return done(err);
        if (user) {
          if (bcrypt.compareSync(body.password, user.client.password)) {
            return done(null, user);
          } else {
            req.authMessage = "Wrong password";
            return done(null, false);
          }
        } else {
          req.authMessage = "No such user with this email";
          return done(null, false);
        }
      });
    })
  )

  passport.use('create-profile', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      var body = req.body;
      User.findOne({ "email": body.email.toLowerCase() }, function (err, resp) {
        if (err) return done(err);
        if (resp) {
          req.authMessage = "User with email '" + body.email.toLowerCase() + "' already exists";
          return done(null, false);
        }
        if (body.password === body.confirmPassword) {
          if (body.birthdate && body.nationality && body.instagram_account && body.phone
            && body.firstName && body.LastName && body.sex) {
            let user = {
              email: body.email.toLowerCase(),
              password: bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null),
              first_name: body.firstName,
              last_name: body.LastName,
              birthdate: body.birthdate,
              sex: body.sex,
              nationality: body.nationality,
              instagram_account: body.instagram_account,
              phone: body.phone,
              mother_agency: body.mother_agency,
              current_agency: body.current_agency,
              invitation_code: body.invitation_code
            }
            User.insertOne(user)
            console.log('user is ',user);
            return done(null, user);
          }
          else {
            req.authMessage = "Please, provide the Name, Surname, Sex, Birthdate, Nationality, Instagram Account, phone Number";
            return done(null, false);
          }
        } else {
          req.authMessage = "password is not confirmed";
          return done(null, false);
        }
      })
    })
  )

  passport.use('user-login', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, email, password, done) {
      var body = req.body;
      User.findOne({ 'email': body.email.toLowerCase() }, function (err, user) {
        if (err) return done(err);
        if (user) {
          if (bcrypt.compareSync(body.password, user.password)) {
            return done(null, user);
          } else {
            req.authMessage = "Wrong password";
            return done(null, false);
          }
        } else {
          req.authMessage = "No such user with this email";
          return done(null, false);
        }
      });
    })
  )
};
