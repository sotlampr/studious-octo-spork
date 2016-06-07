import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Bert } from 'meteor/themeteorchef:bert';

import './contact.html';

Template.contact.events({
  'submit .testemail': function (event) {
    event.preventDefault();
    Meteor.call('email.sendTestEmail', {
      name: event.target.name.value,
      email: event.target.email.value,
      comment: event.target.comments.value
    });
    event.target.name.value = '';
    event.target.email.value = '';
    event.target.comments.value = '';
    Bert.alert('Your comment has been received', 'success', 'growl-top-right');
  }
});
