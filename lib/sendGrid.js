const sgMail = require('@sendgrid/mail');
var config = require('../config/index');
var fs = require('fs');
var path = require('path')

sgMail.setApiKey(config.sendGridKey);

var exports = module.exports = {};

exports.sendConfirmAccountEmail = async (user,req) => {
  var formatedUrl = `${req.protocol}://${req.host}/api/user/${user._id}/confirm/${user.confirmHash}`
    const msg = {
        to: user.email,
        from: 'models@squaremm.com',
        subject: 'Please confirm your account',
        text: `Please follow link: ${formatedUrl}`,
        html: `Please follow link: <a href='${formatedUrl}'>${formatedUrl}</a>`,
      };
      sgMail.send(msg, false, (error) => {
        console.log(error);
      });;
};
exports.sendForgotPasswordEmail = async (temporaryPassword, user) => {
  const msg = {
      to: user.email,
      from: 'models@squaremm.com',
      subject: 'Forgot password',
      text: `Log into your application with temporary password: ${temporaryPassword}`,
      html: `Log into your application with temporary password: <strong>${temporaryPassword}</strong`,
    };
     sgMail.send(msg, false, (error) => {
      if(error) console.log(error);
      });;
}
exports.sendBookingReport = async (email, list, place) => {

  var html = `<h1> Report of bookings for ${ place.name } </h1> <div>`;
  list.forEach(element => {
    html += `<div> ${ element } </div>`
  });
  html += `</div>`
  const msg = {
      to: email,
      from: 'restaurants@squaremm.com',
      subject: 'New booking report',
      text: html,
      html: html,
    };
    sgMail.send(msg, false, (error) => {
     if(error) console.log(error);
    });;
}
exports.sendUserAcceptedMail = async (email, req) => {
  var filePath = path.join(__dirname, '../htmltemplates/userAccepted.html')
  console.log(filePath);
  fs.readFile(filePath, 'utf8', (err, html) => {
    var formatedUrl = `${req.protocol}://${req.host}/accept`;
    html = html.replace('_acceptEmailServerUrl', formatedUrl)
    const msg = {
      to: email,
      from: 'models@squaremm.com',
      subject: 'Welcome to SQUARE!',
      text: html,
      html: html,
    };
    
    sgMail.send(msg, false, (error) => {
      if(error) console.log(error);
    });;
  });
};