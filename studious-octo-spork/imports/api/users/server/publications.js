import { Meteor } from 'meteor/meteor';
import { Suggestions } from '../suggestions.js';

Meteor.publish('users', function fetchUsers() {
  return Meteor.users.find();
});

Meteor.publish('users.suggestions', function fetchUserSuggestions() {
  return Suggestions.find();
});
