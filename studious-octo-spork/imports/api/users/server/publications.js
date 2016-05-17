import { Meteor } from 'meteor/meteor';

Meteor.publish('users', function fetchUsers() {
  return Meteor.users.find();
})
