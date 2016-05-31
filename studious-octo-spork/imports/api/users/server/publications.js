import { Meteor } from 'meteor/meteor';
import { Suggestions } from '../suggestions.js';

Meteor.publish('users', function fetchUsers() {
  return Meteor.users.find({}, {fields: {
    'username': 1,
    'profile.occupation': 1,
    'profile.description': 1,
  }});
});

Meteor.publish('users.suggestions', function fetchUserSuggestions() {
  return Suggestions.find();
});
