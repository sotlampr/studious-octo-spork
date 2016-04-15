import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

Meteor.startup(function () {
  // code to run on server at startup
  // USERNAME: Complete email address (website@gmail.com)
  // PASSWORD: Email password (gmail password)
  // HOST: Smtp server address (for gmail is stmp.gmail.com, for hotmail is stmp.live.com, ...)
  process.env.MAIL_URL = 'smtp://USERNAME:PASSWORD@HOST:587';
});

Accounts.onCreateUser(function (options, user) {
  user.profile = user.profile || {};
  user.profile.occupation = '';
  user.profile.description = '';
  return user;
});

Meteor.methods({
  sendTestEmail: function (data) {
    var bodytext = "Someone '" + data.name + "' with email: " + data.email + " sent you the comment: " + data.comment + " !";
    Email.send({
      from: "", // form web site email (website@gmail.com)
      to: "",   // to admin email (admin@something.com)
      subject: "Subject test",
      text: bodytext
    });
  }
});
