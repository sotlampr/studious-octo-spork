import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './users.html';
import { saveMessage } from '../api/messaging/methods.js';
import { Bert } from 'meteor/themeteorchef:bert';

Template.usersIndex.onCreated(function usersIndexOnCreated() {
  this.subscribe('users');
})

Template.usersIndex.events({
  'submit .find': function (event) {
    event.preventDefault();
    var tar = event.target;
    var id = tar.getAttribute('id');
    Session.set('work', '');
    Session.set('description', '');
    if (id === 'occupation' ) {
      Session.set('work', tar.work.value);
      tar.work.value = '';
    } else {
      Session.set('description', tar.description.value);
      tar.description.value = '';
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
  usersSearch: function () {
    var work = Session.get('work');
    var workSearch = new RegExp(work, 'i');
    var description = Session.get('description');
    var descriptionSearch = new RegExp(description, 'i');
    if (work && work !== '') {
      return Meteor.users.find({'profile.occupation': workSearch});
    } else if (description && description !== '') {
      return Meteor.users.find({'profile.description': descriptionSearch });
    }
  }
});

Template.usersByUsername.onCreated(function usersByUsernameOnCreated() {
  this.subscribe('users');
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

Template.usersContactByUsername.onCreated(function usersContactByUsernameOnCreated() {
  this.subscribe('users');
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
    Bert.alert('Your message has been received', 'success', 'growl-top-right');
  }
});
