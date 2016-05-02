import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';


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
