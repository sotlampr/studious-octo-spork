import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';


export const Events = new Mongo.Collection('events');


Events.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});


Events.schema = new SimpleSchema({
  giverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  receiverId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  title: {
    type: String,
    max: 30,
    label: 'The title of this event.'
  },
  start: {
    type: Date,
    label: 'When this event will start.'
  },
  end: {
    type: Date,
    label: 'When this event will end.'
  },
  giverValidated: {
    type: Boolean,
    defaultValue: false,
  },
  receiverValidated: {
    type: Boolean,
    defaultValue: false,
  }
});


Events.attachSchema(Events.schema);


Events.publicFields = {
  giverId: 1,
  receiverId: 1,
  title: 1,
  start: 1,
  end: 1,
  giverValidated: 1,
  receiverValidated: 1
};
