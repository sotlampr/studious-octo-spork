import { Suggestions  } from '../suggestions.js';
import { Meteor } from 'meteor/meteor';

Meteor.publish('suggestions', function suggestionsPublications() {
  return Suggestions.find();
})
