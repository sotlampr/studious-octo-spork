import { Template } from 'meteor/templating';

// Return the username: usernameFromId(userId) returns username
Template.registerHelper('usernameFromId', (id) => {
    let user = Meteor.users.findOne(id);
    if (user)
      return user.username;
});
