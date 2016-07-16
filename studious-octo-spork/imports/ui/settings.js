import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Suggestions } from '../api/suggestions/suggestions.js';
import './settings.html';


Template.settings.onCreated(function settingsOnCreated() {
  this.subscribe('suggestions');
});


Template.settings.helpers({
  settings: function () {
    return {
      position: "top",
      limit: 3,
      rules: [
        {
          collection: Suggestions,
          field: "suggestion",
          template: Template.autocomplete
        }
      ]
    };
  },

  formData: function () {
    // Data for pre-filling the edit-profile form
    user = Meteor.users.findOne(Meteor.userId());
    if (user) {
      return {
        username: user.username,
        occupation: user.profile.occupation,
        description: user.profile.description,
        email: user.emails[0].address
      };
    }
  },
});


Template.settings.events({
});
