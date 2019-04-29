var apn = require('apn');
var path = require('path');

var apnProviderProduction = new apn.Provider({
    production: true,
    cert: 'cert.pem',
    key: 'key.pem'
});
var apnProviderTest = new apn.Provider({
    production: false,
    cert: path.join(__dirname, '../apnTest/cert.pem'),
    key:  path.join(__dirname, '../apnTest/key.pem')
});

var exports = module.exports = {};

exports.userAcceptNotification = async (devices) => {
    var note = getNotificationNote();
    note.alert = `\uD83D\uDCE7 \u2709 Your account has beed accepted!`;
    note.payload = { message: `Now you have access to all resources`, pushType: 'userAccept' };
      
    devices.forEach(async (device) => {
        await apnProviderProduction.send(note, device);
        await apnProviderTest.send(note, device);
    });
  }
  exports.userRejectNotification = async (devices) => {
    var note = getNotificationNote();
    note.alert = `\uD83D\uDCE7 \u2709 Your account has beed rejected!`;
    note.payload = { message: `You lost access to account`, pushType: 'userRejected' };
  
    devices.forEach(async (device) => {
        await apnProviderProduction.send(note, device);
        await apnProviderTest.send(note, device);
    });
  }
  exports.actionAcceptNotification = async (devices) => {
    var note = getNotificationNote();
    note.alert = `\uD83D\uDCE7 \u2709 You get new credits!`;
    note.payload = { message: `We accepted your action`, pushType: 'actionAccepted' };
  
    devices.forEach(async (device) => {
        await apnProviderProduction.send(note, device);
        await apnProviderTest.send(note, device);
    });
}
exports.creditAddNotification = async (devices, creditValue) => {
  var note = getNotificationNote();
  note.alert = `\uD83D\uDCE7 \u2709 You get new credits!`;
  note.payload = { message: `You get extra credits have fun!`, pushType: 'creditsAdded', credits: creditValue };

  devices.forEach(async (device) => {
    await apnProviderProduction.send(note, device);
    await apnProviderTest.send(note, device);
  });
}
exports.bookingClosedNotification = async (devices, payed, placeName) => {
    var note = getNotificationNote();

    note.alert = `\uD83D\uDCE7 \u2709 Booking closed!`;
    note.payload = { 
      message: `Your booking has been closed you lost change to get points`,
      pushType: 'bookingClosed', 
      bookingCredits: payed,
      bookingName : placeName
     };
  
    devices.forEach(async (device) => {
        await apnProviderProduction.send(note, device);
        await apnProviderTest.send(note, device);
     });
  };
  exports.sendReferralINotification = async (deviceId, user) => {
    var note = getNotificationNote();
    note.alert = `\uD83D\uDCE7 \u2709 New referral!`;
    note.payload = { message: `You have one new referral: ${user}`, referralAccepted: 1 };
  
    var data = await apnProvider.send(note, deviceId);
    return data;
  }
function getNotificationNote(){
    var note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = 1;
    note.topic = 'com.squaregroup.ModelsApp.new';
    return note;
}
