import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Suggestions } from './suggestions.js';


// saveSuggestion takes an occupation, and if there isn't
// already in suggestions collection, then insert it
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
