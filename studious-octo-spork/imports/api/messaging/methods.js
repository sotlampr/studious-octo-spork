import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Messages } from './messaging.js';


/* Typical validation routine, for use by messaging methods:
 * -Check if message exists
 * -Check if message is deleted
 * -Check if message does not belong to the caller.
 * args:
 *   messageId, callerId
 */
function routineValidation (messageId, callerId) {
    if (!Messages.findOne(messageId)) {
      throw new Meteor.Error('message-not-found');
    }

    if (!Messages.findOne(messageId).visible) {
      throw new Meteor.Error('message-deleted');
    }

    if (Messages.findOne(messageId).receiverId !== callerId) {
      throw new Meteor.Error('message-not-yours');
    }
};

/* Save a new message
 * args:
 *   receiverId:
 *     Mongo _id for the user that recieves this message.
 *   message:
 *     String, the message body.
 */
export const saveMessage = new ValidatedMethod({
  name: 'messaging.saveMessage',
  validate: new SimpleSchema({
    receiverId: { type: String },
    message: { type: String }
  }).validator(),
  run (data) {

    // Throw an error if there is no such receiver
    if (!Meteor.users.findOne(data.receiverId)) {
      throw new Meteor.Error('user-not-exist');
    }

    if (this.userId == data.receiverId) {
      throw new Meteor.Error(
        'messages.saveMessage.selfToSelf',
        'Cannot send a message to yourself!'
      );
    }

    // Insert the new message
    Messages.insert({
      receiverId: data.receiverId,
      message: data.message,
      giverId: this.userId,
      dateCreated: new Date(),
      read: false,
      visible: true
    });
  },
});

/* Reverse the 'read' flag of a message
 * args:
 *   messageId:
 *     Mongo _id for the message we want to toggle.
 */
export const toggleRead = new ValidatedMethod({
  name: 'messaging.toggleRead',
  validate: new SimpleSchema({
    messageId: { type: String }
  }).validator(),
  run (data) {
    routineValidation(data.messageId, this.userId);
    // Reverse the existing read status and update
    reversed = !Messages.findOne(data.messageId).read;
    Messages.update({_id: data.messageId}, {$set: {read: reversed}});
  },
});

/* Delete a message
 * args:
 *   messageId:
 *     Mongo _id for the message we want to toggle.
 */
export const deleteMessage = new ValidatedMethod({
  name: 'messaging.deleteMessage',
  validate: new SimpleSchema({
    messageId: { type: String }
  }).validator(),
  run (data) {
    routineValidation(data.messageId, this.userId);
    Messages.update({_id: data.messageId}, {$set: {visible: false}});
  },
});
