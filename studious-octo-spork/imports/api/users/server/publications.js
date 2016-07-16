import { Meteor } from 'meteor/meteor';

Meteor.publish('users', function fetchUsers() {
  return Meteor.users.find({}, {fields: {
    'username': 1,
    'profile.occupation': 1,
    'profile.description': 1,
    'characteristic': 1
  }});
});
