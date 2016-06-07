import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Suggestions } from '../suggestions/suggestions.js';

export const saveSuggestion = new ValidatedMethod({
  name: 'suggestions.saveSuggestion',
  validate: new SimpleSchema({
    suggestion: { type: String },
  }).validator(),
  run (data) {
    if (Suggestions.find({suggestion: data.suggestion}).count() === 0) {
      Suggestions.insert({
        suggestion: data.suggestion,
      });
    }
  }
});
