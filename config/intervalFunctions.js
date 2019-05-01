var db = require('../config/connection');
var apn = require('apn');
var moment = require('moment');
var sendGrid = require('../lib/sendGrid');
var pushProvider = require('../lib/pushProvider');

exports.checkBookingExpired = function(db){
    setInterval(() => {
      intervalFuncCheckBookingExpired(db);
    }, 60000);
  }
  exports.sendReportBookingEmail = function(db){
    setInterval(() => {
      intervalFuncSendReportBookingEmail(db);
    }, 900000);
  }
  
function intervalFuncCheckBookingExpired (db) {
    console.log(`start interval function bookingExpired, at ${moment()}`);
    db.getInstance(function (p_db) {
        User = p_db.collection('users');
        Booking = p_db.collection('bookings'); 
        Place = p_db.collection('places');

        //retrive all users -> may be need to send push notification
        User.find({ accepted: true , bookings: { $gt: 0 } }).toArray(async (userError, users) => {
                //find all bookings that are not closed yet
                Booking.find({closed: false}).toArray( async (bookingError, bookings) => {
                        //check if any booking should be closed 
                        bookings.forEach(booking => {

                            var date = moment(booking.date + ' ' + booking.endTime, 'DD-MM-YYYY HH.mm');
                            var tommorow = moment(date.add('1', 'days').format('DD-MM-YYYY'), 'DD-MM-YYYY');
                            var diff = tommorow.diff(moment(), 'days');
                            if (diff < 0 && !booking.closed) {
                                //update booking 
                                Booking.findOneAndUpdate({_id: booking._id}, {$set: {closed: true}}, async (x) => {
                                        var user = users.find(user => user._id == booking.user);
                                        if(user){
                                            console.log('send notification');
                                          var place = await Place.findOne({_id: booking.place});
                                          await pushProvider.bookingClosedNotification(user.devices, booking.payed, place.name);
                                        }
                                    });
                            }
                        });
                    });
                    
            });
    });
}
function intervalFuncSendReportBookingEmail (db) {
  console.log(`start interval function reportSend, at ${moment()}`);
  db.getInstance(function (p_db) {
      Booking = p_db.collection('bookings'); 
      Place = p_db.collection('places');
      User = p_db.collection('users');

      var currentHour = parseInt(moment().format('hh'));
      var currentMinute = parseInt(moment().format('mm'));
      if(currentHour == 19 && currentMinute <= 20){
        //retrive all users -> may be need to send push notification
        User.find({ accepted: true }).toArray(async (userError, users) => {
        Place.find({ }).toArray(async (error, places) => {
          places.forEach(async (place) => {
            if(place.notificationRecivers && place.notificationRecivers.length > 0){
              var today = moment().format('DD-MM-YYYY');
             await Booking.find({ creationDate: {$eq: today}, place: place._id }).toArray(async (error, bookings) => {
                var listToSend = [];
                await bookings.forEach(async (booking) => {
                  var user = users.find(x=>x._id == booking.user);
                  listToSend.push(`booking date: ${ booking.date }, time:  ${booking.startTime }-${booking.endTime }, user:  ${user.email }, ${user.name } ${user.surname } `);
                });
                place.notificationRecivers.forEach(async (reciver) => {
                 await sendGrid.sendBookingReport(reciver.email, listToSend, place);
                });
              });
            }
          });
        });
      });
      }
  });
}
