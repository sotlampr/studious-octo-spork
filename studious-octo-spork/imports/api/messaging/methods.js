import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Messages } from './messaging.js';

export const saveMessage = new ValidatedMethod({
  name: 'messaging.saveMessage',
  // TODO: validation!
  validate: null,
  run (data) {
    if (Meteor.user().username !== data.from) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Meteor.users.findOne({username: data.to})) {
      throw new Meteor.Error('user-not-exist');
    }
    Messages.insert(data);
  }
})
