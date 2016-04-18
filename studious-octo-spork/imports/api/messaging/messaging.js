import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Messages = new Mongo.Collection('messages');
Messages.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Messages.schema = new SimpleSchema({
  toUser: {
    type: String,
  },
  fromUser: {
    type: String,
  },
  message: {
    type: String,
    max: 320,
  },
  dateCreated: {
    type: Date,
  },
  read: {
    type: Boolean,
    defaultValue: false,
  },
  visible: {
    type: Boolean,
    defaultValue: true,
  },
});

Messages.attachSchema(Messages.schema)

// Fields that should be published
Messages.publicFields = {
  toUser: 1,
  fromUser: 1,
  message: 1,
  dateCreated: 1,
  read: 1,
  visible: 1,
};
