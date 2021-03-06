import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './body.html';


export const avatar = function (user, size) {
  return Gravatar.imageUrl(
    user.md5hash,
    {
      secure: true,
      size: size,
      d: user.profile.avatarType,
    }
  );
};


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
    Bert.alert(
      'Your comment has been received',
      'success',
      'growl-top-right'
    );
  }
});


Template.App_body.onCreated(function AppBodyOnCreated() {
  this.subscribe('users');
});


Template.App_body.helpers({
  avatar: avatar
});


Template.hello.onCreated(function helloOnCreated() {
  this.subscribe('users');
});


Template.hello.helpers({
  randomUsers: function () {
    return _.sample(Meteor.users.find({}).fetch(), 3);
  },

  avatar: avatar
});
