import { Meteor } from 'meteor/meteor'

Meteor.startup(function () {
  // code to run on server at startup
  // USERNAME: Complete email address (website@gmail.com)
  // PASSWORD: Email password (gmail password)
  // HOST: Smtp server address (for gmail is smtp.gmail.com, for hotmail is smtp.live.com, ...)
  process.env.MAIL_URL = 'smtp://USERNAME:PASSWORD@HOST:587';
});
