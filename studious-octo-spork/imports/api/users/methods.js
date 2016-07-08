import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Suggestions } from '../suggestions/suggestions.js';

/* Update a users profile (description, occupation, username)
 * args:
 *   id:
 *     Mongo id of the user.
 *   username:
 *     String, username to save.
 *   occupation:
 *     String, occupation to save.
 *   description:
 *     String, description to save.
 */
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
