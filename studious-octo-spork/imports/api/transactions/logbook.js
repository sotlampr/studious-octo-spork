import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Logbook = new Mongo.Collection('logbook');

Logbook.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Logbook.schema = new SimpleSchema({
  fromId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  toId: {
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
  fromOk: {
    type: Boolean,
    defaultValue: false,
  },
  toOk: {
    type: Boolean,
    defaultValue: false,
  },
});

Logbook.attachSchema(Logbook.schema);

// Fields that should be published
Logbook.publicFields = {
  fromId: 1,
  toId: 1,
  date: 1,
  cost: 1,
  description: 1,
  fromOk: 1,
  toOk: 1,
};
