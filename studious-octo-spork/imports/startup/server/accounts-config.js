import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.onCreateUser(function (options, user) {
  user.profile = user.profile || {};
  user.profile.occupation = '';
  user.profile.description = '';
  user.profile.balance = 0.0;
  user.profile.logisticBalance = 0.0;
  user.profile.avatarType = 'retro';
  user.characteristic = '';
  user.md5hash= Gravatar.hash(user.emails[0].address);
  return user;
});

Meteor.methods({
  'userExists': function (username) {
    return (Meteor.users.findOne({username: username})) ? true : false;
  },
});
