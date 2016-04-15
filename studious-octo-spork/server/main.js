import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Email } from 'meteor/email';

import { Messages } from '../imports/api/messaging.js'

Meteor.startup(function () {
  // code to run on server at startup
  // USERNAME: Complete email address (website@gmail.com)
  // PASSWORD: Email password (gmail password)
  // HOST: Smtp server address (for gmail is stmp.gmail.com, for hotmail is stmp.live.com, ...)
  process.env.MAIL_URL = 'smtp://USERNAME:PASSWORD@HOST:587';
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
  },

  updateUserProfile: function (data) {
    // Handle updating of user profile
    if (Meteor.userId() !== data.id) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(data.id, {$set: {
      username: data.username,
      'profile.occupation': data.occupation,
      'profile.description': data.description
    }}, {validate: false});
  },

  saveMessage: function (data) {
    if (Meteor.user().username !== data.from) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Meteor.users.findOne({username: data.to})) {
      throw new Meteor.Error('user-not-exist');
    }
    Messages.insert(data);
  }
});

Accounts.onCreateUser(function (options, user) {
    user.profile = user.profile || {};
    user.profile.occupation = '';
    user.profile.description = '';
    return user;
  });
