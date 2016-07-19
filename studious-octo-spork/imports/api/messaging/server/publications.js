import { Meteor } from 'meteor/meteor';

import { Messages } from '../messaging.js';


/* Publish messages where current user is the receiver,
 * only public fields.
 */
Meteor.publish('messages.user', function messagesUser() {
  return Messages.find(
    { receiverId: this.userId },
    { fields: Messages.publicFields }
  );
});
