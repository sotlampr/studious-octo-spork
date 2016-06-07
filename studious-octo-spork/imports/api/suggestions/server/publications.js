import { Meteor } from 'meteor/meteor';

import { Suggestions  } from '../suggestions.js';

Meteor.publish('suggestions', function suggestionsPublications() {
  return Suggestions.find();
})
