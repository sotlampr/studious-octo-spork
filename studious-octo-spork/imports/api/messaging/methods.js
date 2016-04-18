import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Messages } from './messaging.js';

export const saveMessage = new ValidatedMethod({
  name: 'messaging.saveMessage',
  validate: new SimpleSchema({
    toUser: { type: String },
    message: { type: String }
  }).validator(),
  run (data) {
    if (!Meteor.users.findOne({username: data.toUser})) {
      throw new Meteor.Error('user-not-exist');
    };
    Messages.insert({
      toUser: data.toUser,
      message: data.message,
      fromUser: Meteor.user().username,
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
    if (!Messages.findOne(messageId)) {
      throw new Meteor.Error('message-not-found')
    };
    if (!Messages.findOne(messageId).visible) {
      throw new Meteor.Error('message-deleted')
    };
    if (Messages.findOne(messageId).toUser !== Meteor.user().username) {
      throw new Meteor.Error('message-not-yours')
    };
    reversed = !Messages.findOne(messageId).read;
    Messages.update({_id: messageId}, {$set: {read: reversed}});
  },
});

export const deleteMessage = new ValidatedMethod({
  name: 'messaging.deleteMessage',
  validate: null,
  run (messageId) {
    if (!Messages.findOne(messageId)) {
      throw new Meteor.Error('message-not-found')
    };
    if (!Messages.findOne(messageId).visible) {
      throw new Meteor.Error('message-deleted')
    };
    if (Messages.findOne(messageId).toUser !== Meteor.user().username) {
      throw new Meteor.Error('message-not-yours')
    };
    Messages.update({_id: messageId}, {$set: {visible: false}});
  },
});
