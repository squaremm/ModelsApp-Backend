const sgMail = require('@sendgrid/mail');
var config = require('../config/index');

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

    });;
}