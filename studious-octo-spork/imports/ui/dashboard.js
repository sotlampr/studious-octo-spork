import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Messages } from '../api/messaging/messaging.js';
import { Logbook } from '../api/transactions/logbook.js';

import { toggleRead } from '../api/messaging/methods.js';
import { deleteMessage } from '../api/messaging/methods.js';
import { approveTransaction } from '../api/transactions/methods.js';

import { Suggestions } from '../api/users/suggestions.js';
import { updateUserProfile } from '../api/users/methods.js';
import { saveSuggestion } from '../api/users/methods.js';

import './dashboard.html';

Template.dashboard.onCreated(function dashboardOnCreated() {
  this.subscribe('messages.user');
  this.subscribe('logbook.user');
  this.subscribe('users');
  this.subscribe('users.suggestions');
});

Template.dashboard.helpers({
  settings: function () {
    return {
      position: "top",
      limit: 5,
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
      var userMessages = Messages.find(
          {toId: Meteor.user()._id, visible:true},
          {sort: {read: 1, dateCreated: -1}});
      return userMessages;
    }
  },
  userTransactions: function () {
    // Retrieve the last 5 user transactions
    if (Meteor.user()) {
      var userTransactions = Logbook.find(
          {}, {sort: {date: -1}, limit: 8}
      );
      return userTransactions;
    }
  },
  usernameFromId: function (id) {
    let user = Meteor.users.findOne(id);
    if (user)
      return user.username;
  },
});

Template.dashboard.events({
  'click .transactions-redirect': () => {
     FlowRouter.go('/dashboard/transactions');
  },
  'submit .update-profile': function (event) {
    // Handle the updating logic, call updateUserProfile afterwards
    event.preventDefault();
    updateUserProfile.call({
      id: Meteor.userId(),
      username: event.target.username.value,
      occupation: event.target.occupation.value,
      description: event.target.description.value
    });
    saveSuggestion.call({suggestion: event.target.occupation.value});

  },
  'click .toggle-read': function() {
    toggleRead.call(this._id);
  },
  'click .delete': function () {
    deleteMessage.call(this._id);
  }
});

Template.renderApprovalStatus.helpers({
  equals: function(a, b) {
    return a == b;
  },
});

Template.renderApprovalStatus.events({
  'click #approve': function(event) {
    approveTransaction.call(this);
  }
});
