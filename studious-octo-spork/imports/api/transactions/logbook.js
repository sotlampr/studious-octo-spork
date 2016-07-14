import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Logbook = new Mongo.Collection('logbook');

Logbook.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Logbook.schema = new SimpleSchema({
  // Mongo _id for the user that 'employs'
  giverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Mongo _id for the user that 'works'
  receiverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  // Small text description, max 320 chars
  description: {
    type: String,
    max: 320,
  },
  // Insertion or Work date
  date: {
    type: Date,
  },
  // How much the work cost
  cost: {
    type: Number
  },
  // Boolean indicating if giver has validated the transaction
  giverValidated: {
    type: Boolean,
    defaultValue: false,
  },
  // Boolean indicating if receiver has validated the transaction
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
