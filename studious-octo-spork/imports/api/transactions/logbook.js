import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Logbook = new Mongo.Collection('logbook');

Logbook.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Logbook.schema = new SimpleSchema({
  giverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  receiverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  description: {
    type: String,
    max: 320,
  },
  date: {
    type: Date,
  },
  cost: {
    type: Number
  },
  giverValidated: {
    type: Boolean,
    defaultValue: false,
  },
  receiverValidated: {
    type: Boolean,
    defaultValue: false,
  },
});

Logbook.attachSchema(Logbook.schema);

// Fields that should be published
Logbook.publicFields = {
  giverId: 1,
  receiverId: 1,
  date: 1,
  cost: 1,
  description: 1,
  giverValidated: 1,
  receiverValidated: 1,
};
