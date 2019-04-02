var db = require('../config/connection');
var apn = require('apn');
var moment = require('moment');

var apnProvider = new apn.Provider({
  production: false,
});

async function userAcceptNotification(deviceId, user) {
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.alert = `\uD83D\uDCE7 \u2709 Your account has beed accepted!`;
    note.payload = { message: `Now you have access to all resources`, pushType: 'userAccept' };
  
    var data = await apnProvider.send(note, deviceId);
    return data;
  };

  var User, Place, Offer, OfferPost, Booking;
  db.getInstance(function (p_db) {
    User = p_db.collection('users');
    Place = p_db.collection('places');
    Offer = p_db.collection('offers');
    OfferPost = p_db.collection('offerPosts');
    Booking = p_db.collection('bookings');
  });

module.exports = function() {
  function checkBookingExpired(){
    setInterval(intervalFunc,1500);
  }
  function intervalFunc() {
    console.log("It is working");
   }
}