import { Template } from 'meteor/templating';

Template.registerHelper('usernameFromId', (id) => {
    let user = Meteor.users.findOne(id);
    if (user)
      return user.username;
});
