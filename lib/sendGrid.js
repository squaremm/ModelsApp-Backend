const sgMail = require('@sendgrid/mail');
var config = require('../config/index');
var fs = require('fs');
var path = require('path');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: config.sentryUrl });
sgMail.setApiKey(config.sendGridKey);

var exports = module.exports = {};

exports.sendConfirmAccountEmail = async (user, req) => {
  const formatedUrl = `${config.hostname}/api/user/${user._id}/confirm/${user.confirmHash}`;
  const filePath = path.join(__dirname, '../htmlTemplates/thanks-for-applying.html');
  let html = await new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      'utf8',
      (err, html) => {
        if (err) reject(err)
        resolve(html)
      });
  });
  html = html.replace('_NameVariable', user.email.split("@")[0]);
  html = html.replace('_VerifyMailVariable', formatedUrl);
  const msg = {
    to: user.email,
    from: 'models@squaremm.com',
    subject: 'Please confirm your email',
    text: `Welcome to SQUARE! Please verify your email`,
    html: html,
  };
  send(msg);
};
exports.sendThanksForInterestEmail = async (user) => {
  const filePath = path.join(__dirname, '../htmlTemplates/thanks-for-interest.html');
  let html = await new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      'utf8',
      (err, html) => {
        if (err) reject(err)
        resolve(html)
      });
  });
  html = html.replace('_UserNameVariable', user.name || user.email.split("@")[0]);
  const msg = {
    to: user.email,
    from: 'models@squaremm.com',
    subject: 'Thanks for interest',
    text: `Thank you for your interest in SQUARE`,
    html: html,
  };
  send(msg);
};
exports.sendEmailChangedNotification = async (user, newEmail) => {
  const msg = {
    to: user.email,
    from: 'models@squaremm.com',
    subject: 'Email changed',
    text: `You have successfully changed your email to ${newEmail}.\n`+
      `If it wasn't you, please contact support.`,
  };
  send(msg);
};
exports.sendForgotPasswordEmail = async (temporaryPassword, user) => {
  const msg = {
    to: user.email,
    from: 'models@squaremm.com',
    subject: 'Forgot password',
    text: `Log into your application with temporary password: ${temporaryPassword}`,
    html: `Log into your application with temporary password: <strong>${temporaryPassword}</strong`,
  };
  send(msg);
}
exports.sendNewReservation = async (booking, place, offers, user) => {
  const filePath = path.join(__dirname, '../htmlTemplates/booking-details.html');
  let html = await new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      'utf8',
      (err, html) => {
        if (err) reject(err)
        resolve(html)
      });
  });
  html = html.replace('_UserImageVariable', user.mainImage || "https://res.cloudinary.com/hzaqtgiqa/image/upload/v1574103984/no_image_futf05.png");
  let fullName = user.name || "";
  fullName += fullName + (user.surname || "");
  html = html.replace('_UserNameVariable', fullName);
  let ordersHtml = "";
  for (const offer of offers) {
    ordersHtml += `<p class="order"><span class="order__amount">1</span><span class="order__text">${offer.name}</span></p>`;
  }
  html = html.replace('_OrdersHtmlVariable', ordersHtml);
  html = html.replace('_PlaceNameVariable', place.name);
  html = html.replace('_TimeframesVariable', `${booking.startTime} - ${booking.endTime}`);
  const msg = {
    to: user.email,
    from: 'restaurants@squaremm.com',
    subject: 'You have a new reservation!',
    text: html,
    html: html,
  };
  send(msg);
}
exports.sendBookingCreated = async (email, list, place) => {

  var html = `<h1> New booking created for ${place.name} </h1> <div>`;
  list.forEach(element => {
    html += `<div> ${element} </div>`
  });
  html += `</div>`
  const msg = {
    to: email,
    from: 'restaurants@squaremm.com',
    subject: 'New booking report',
    text: html,
    html: html,
  };
  send(msg);
}
exports.sendUserAcceptedMail = async (user, req) => {
  var filePath = path.join(__dirname, '../htmlTemplates/welcome-on-board.html');
  fs.readFile(filePath, 'utf8', (err, html) => {
    if (err) console.log(err);
    html = html.replace('_UserNameVariable', user.name || user.email.split("@")[0]);
    const msg = {
      to: user.email,
      from: 'models@squaremm.com',
      subject: 'Welcome to SQUARE!',
      text: html,
      html: html,
    };
    send(msg);
  });
};
send = (msg) => {
  sgMail.send(msg, false, (error) => {
    if (error) {
      console.log(error);
      Sentry.captureException(error);
    }
  });;
}