import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './body.html';


Template.App_body.events({
  'click .signout': function () {
    // logout
    Meteor.logout();
    FlowRouter.go('/');
  },

  'submit .testemail': function (event) {
    event.preventDefault();
    Meteor.call('email.sendTestEmail', {
      name: event.target.name.value,
      email: event.target.email.value,
      comment: event.target.comments.value
    });
    event.target.reset();
    Bert.alert('Your comment has been received', 'success', 'growl-top-right');
  }
});


Template.hello.onCreated(function helloOnCreated() {
  this.subscribe('users');
});


Template.hello.helpers({
  randomUsers: function () {
    return Meteor.users.find({}, {limit: 3});
  },
});
