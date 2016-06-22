import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.onCreateUser(function (options, user) {
  user.profile = user.profile || {};
  user.profile.occupation = '';
  user.profile.description = '';
  return user;
});

Meteor.methods({
  'userExists': function (username) {
    return (Meteor.users.findOne({username: username})) ? true : false;
  },
});
