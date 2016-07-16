import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Suggestions } from '../suggestions/suggestions.js';


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


/*  After submit Edit Profile form the method takes the inputs
 *  and update the corresponding users collection entry
 */
export const editUserProfile = new ValidatedMethod({
  name: 'users.editUserProfile',

  validate: new SimpleSchema({
    id: { type: String },
    username: { type: String },
    occupation: { type: String },
    description: { type: String },
    email: { type: String },
    characteristic: { type: String }
  }).validator(),

  run (data) {
    if (this.userId !== data.id) {
      throw new Meteor.Error(
        'users.editUserProfile.not-authorized',
        'Not authorized'
      );
    }

    var user = Meteor.users.findOne({username: data.username});
    if (user) {

      if (this.userId !== user._id) {
        throw new Meteor.Error(
          'users.editUserProfile.the-username-exists',
          'The username exists'
        );
      }
    }

    if (data.email !== user.emails[0].address) {
      Meteor.users.update({_id: data.id}, {$set: {
        'emails.0.verified': false}
      });
    }

    Meteor.users.update({_id: data.id}, {$set: {
      username: data.username,
      'profile.occupation': data.occupation,
      'profile.description': data.description,
      'emails.0.address': data.email,
      characteristic: data.characteristic}
    });
  }
});
