import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Messages } from './messaging.js';

export const saveMessage = new ValidatedMethod({
  name: 'messaging.saveMessage',
  validate: Messages.schema.validator(), run (data) {
    if (Meteor.user().username !== data.fromUser) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Meteor.users.findOne({username: data.toUser})) {
      throw new Meteor.Error('user-not-exist');
    }
    Messages.insert(data);
  }
})
