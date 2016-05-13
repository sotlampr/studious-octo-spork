import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './users.html';
import { saveMessage } from '../api/messaging/methods.js';

Template.usersIndex.events({
  'submit .find': function (event) {
    event.preventDefault();
    var id = event.target.getAttribute('id');
    if (id === 'occupation' ) {
      var work = event.target.work.value;
      event.target.work.value = '';
      Session.set('work', work);
    }
    if (id === 'description') {
      var description = event.target.description.value;
      event.target.description.value = '';
      Session.set('description', description);
    }
  }
});

Template.usersIndex.helpers({
  users: function () {
    return Meteor.users.find();
  },

  path: function (username) {
    return FlowRouter.path('/users/:username', {username: username});
  },

  //  ---EXAMPLE---
  // There is a dog with
  // username: jack
  // occupation: hunter
  // description: birds cats rabbits
  //
  // Searching with occupation:
  //  -success: hunter, hun, HuNTe
  // Searching with description:
  //  -success: birds cats rabbits, CAt, Ts Rab
  //  -fail: rabbits cats
  usersSearchWithOccupation: function () {
    var work = Session.get('work');
    var workSearch = new RegExp(work, 'i');
    if (work) {
      return Meteor.users.find({'profile.occupation': workSearch});
    }
  },

  usersSearchWithDescription: function () {
    var description = Session.get('description');
    var descriptionSearch = new RegExp(description, 'i');
    if (description) {
      return Meteor.users.find({'profile.description': descriptionSearch });
    }
  }
});

Template.usersByUsername.helpers({
  targetUsername: function() {
    return FlowRouter.getParam('username');
  },

  userData: function () {
    var targetUsername = FlowRouter.getParam('username');
    var targetUser = Meteor.users.findOne({username: targetUsername});
    if (targetUser) {
      return {
        username: targetUser.username,
        occupation: targetUser.profile.occupation,
        description: targetUser.profile.description
      };
    }
  }
});

Template.usersContactByUsername.helpers({
  targetUsername: function() {
    return FlowRouter.getParam('username');
  },
});

Template.usersContactByUsername.events({
  'submit .send-message': function (event) {
    // Dump a new message on the Messages Collection
    event.preventDefault();
    username = FlowRouter.getParam('username');
    saveMessage.call({
      toId: Meteor.users.findOne({username: username})._id,
      message: event.target.message.value,
    });
    event.target.message.value = '';
  }
});
