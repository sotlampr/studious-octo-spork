import { Meteor } from 'meteor/meteor';

import { Messages } from '../messaging.js';

Meteor.publish('messages.user', function messagesUser() {
  return Messages.find(
    {toId: this.userId},
    {fields: Messages.publicFields}
  );
});
