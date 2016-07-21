import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const Messages = new Mongo.Collection('messages');
Messages.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Messages.schema = new SimpleSchema({
  // Mongo _id for user who receives the message
  receiverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Mongo _id for user who sends the message
  giverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Message text, maximum 320 chars
  message: {
    type: String,
    max: 320,
  },
  dateCreated: {
    type: Date,
  },
  // Read flag, user toggleable
  read: {
    type: Boolean,
    defaultValue: false,
  },
  // Delete flag, when the user deletes the message it just turns invisible
  visible: {
    type: Boolean,
    defaultValue: true,
  },
});

Messages.attachSchema(Messages.schema);

// Fields that should be published
Messages.publicFields = {
  receiverId: 1,
  giverId: 1,
  message: 1,
  dateCreated: 1,
  read: 1,
  visible: 1,
};
