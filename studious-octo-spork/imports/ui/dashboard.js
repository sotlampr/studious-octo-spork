import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './dashboard.html';

Template.dashboard.helpers({
  settings: function () {
    return {
      position: "top",
      limit: 5,
      rules: [
        {
          collection: Meteor.users,
          field: "profile.occupation",
          template: Template.autocomplete
        }
      ]
    };
  },
  formData: function () {
    // Data for pre-filling the dashboard form
    user = Meteor.users.findOne(Meteor.userId());
    if (user) {
      return {
        id: user._id,
        username: user.username,
        occupation: user.profile.occupation,
        description: user.profile.description
      };
    }
  },
  userMessages: function () {
    // See if we have any messages for this user
    if (Meteor.user()) {
      var reciever = Meteor.user().username;
      var userMessages = Messages.find(
          {to: reciever, visible:true},
          {sort: {read: -1, dateCreated: -1}});
      return userMessages;
    }
  }
});

Template.dashboard.events({
  'submit .update-profile': function (event) {
    // Handle the updating logic, call updateUserProfile afterwards
    event.preventDefault();
    Meteor.call('updateUserProfile', {
      id: Meteor.userId(),
      username: event.target.username.value,
      occupation: event.target.occupation.value,
      description: event.target.description.value
    });
  },
  'click .toggle-read': function() {
    Messages.update({_id: this._id}, {$set: {read: !this.read}});
  },
  'click .delete': function () {
    Messages.update({_id: this._id}, {$set: {visible: false}});
  }
});
