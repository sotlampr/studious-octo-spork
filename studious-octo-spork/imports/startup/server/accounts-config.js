import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser(function (options, user) {
    user.profile = user.profile || {};
    user.profile.occupation = '';
    user.profile.description = '';
    user.profile.balance = 0.0;
    user.profile.logisticBalance = 0.0;
    return user;
});
