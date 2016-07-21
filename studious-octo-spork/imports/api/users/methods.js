import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Suggestions } from '../suggestions/suggestions.js';


/* Update a users profile (description, occupation, username)
 * args:
 *   id:
 *     Mongo _id of the user.
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


/*  Edit a user profile (username, occupation, description,
 *  email, characteristic)
 *    args:
 *      id:
 *        Mongo _id of the user
 *      username:
 *        String, username to save
 *      occupation:
 *        String, occupation to save
 *      email:
 *        String, email to save
 *      characteristic:
 *        String, characteristic to save
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

    if (data.email !==
        Meteor.users.findOne({_id: this.userId}).emails[0].address) {
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


/*  Delete a user account
 *    args:
 *      id: The user id
 */
export const deleteAccount = new ValidatedMethod({
  name: 'users.deleteAccount',

  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),

  run (data) {
    if (this.userId !== data.id) {
      throw new Meteor.Error(
        'users.deleteAccount.you-have-not-the-right',
        'You have not the right'
      );
    }

    Meteor.users.remove({_id: data.id});
  },
});
