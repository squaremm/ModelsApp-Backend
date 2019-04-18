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