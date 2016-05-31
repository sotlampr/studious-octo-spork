import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Suggestions } from './suggestions.js';


export const updateUserProfile = new ValidatedMethod({
  name: 'users.updateUserProfile',

  validate: new SimpleSchema({
    id: { type: String },
    username: { type: String },
    occupation: { type: String },
    description: { type: String }
  }).validator(),

  run (data) {
    // Handle updating of user profile
    if (this.userId !== data.id) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(data.id, {$set: {
      username: data.username,
      'profile.occupation': data.occupation,
      'profile.description': data.description
    }}, {validate: false});
  },
});

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
