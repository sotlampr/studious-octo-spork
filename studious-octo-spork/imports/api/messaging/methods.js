import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Messages } from './messaging.js';

const routineValidation = (messageId, callerId) => {
  // Typical validation routine.
  //   1. Check if message exists
  //   2. Check if message is deleted
  //   3. Check if message does not belong to the caller.
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

export const toggleRead = new ValidatedMethod({
  name: 'messaging.toggleRead',
  validate: null,
  run (messageId) {
    routineValidation(messageId, this.userId);
    // Reverse the existing read status and update
    reversed = !Messages.findOne(messageId).read;
    Messages.update({_id: messageId}, {$set: {read: reversed}});
  },
});

export const deleteMessage = new ValidatedMethod({
  name: 'messaging.deleteMessage',
  validate: null,
  run (messageId) {
    routineValidation(messageId, this.userId);
    Messages.update({_id: messageId}, {$set: {visible: false}});
  },
});
