import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Suggestions } from '../api/suggestions/suggestions.js';
import { saveSuggestion } from '../api/suggestions/methods.js';
import { editUserProfile } from '../api/users/methods.js';
import { deleteAccount } from '../api/users/methods.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './settings.html';


Template.settings.onCreated(function settingsOnCreated() {
  this.subscribe('suggestions');
  this.subscribe('users');
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
        email: user.emails[0].address,
        characteristic: user.characteristic
      };
    }
  },
});


Template.settings.events({
  'submit #edit-profile': function (event) {
    // Handle the updating logic, call editUserProfile afterwards
    event.preventDefault();

    editUserProfile.call({
      id: Meteor.userId(),
      username: event.target.username.value,
      occupation: event.target.occupation.value,
      description: event.target.description.value,
      email: event.target.email.value,
      characteristic: event.target.characteristic.value
    }, (err, res) => {
      if (err) {
        Bert.alert(err.reason, 'warning', 'growl-top-right');
      } else {
        saveSuggestion.call({
          suggestion: event.target.occupation.value
        });
        Bert.alert(
          'Your profile has been updated',
          'success',
          'growl-top-right'
        );
      }
    });
  },
});


Template.deleteAccountModal.events({
  'submit #delete-account': function (event, template) {
    event.preventDefault();

    deleteAccount.call({
      id: Meteor.userId()
    }, (err, res) => {
      if (err) {
        Bert.alert(err.reason, 'warning', 'growl-top-right');
      } else {
        $('.modal-backdrop').remove();
        FlowRouter.go("/");
        Bert.alert('Your account deleted', 'success', 'growl-top-right');
      }
    });
  }
});
