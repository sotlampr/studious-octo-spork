import { Accounts } from 'meteor/accounts-base'

Accounts.onCreateUser(function (options, user) {
    user.profile = user.profile || {};
    user.profile.occupation = '';
    user.profile.description = '';
    return user;
  });
