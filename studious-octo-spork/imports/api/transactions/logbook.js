import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Logbook = new Mongo.Collection('logbook');

Logbook.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Logbook.schema = new SimpleSchema({
  employerId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  workerId: {
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
  employerOk: {
    type: Boolean,
    defaultValue: false,
  },
  workerOk: {
    type: Boolean,
    defaultValue: false,
  },
});

Logbook.attachSchema(Logbook.schema);

// Fields that should be published
Logbook.publicFields = {
  employerId: 1,
  workerId: 1,
  date: 1,
  cost: 1,
  employerOk: 1,
  workerOk: 1,
};
