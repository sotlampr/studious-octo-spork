import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Events = new Mongo.Collection('events');

Events.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Events.schema = new SimpleSchema({
  giver: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  receiver: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  title: {
    type: String,
    max: 30,
    label: 'The title of this event.'
  },
  start: {
    type: String,
    max: 30,
    label: 'When this event will start.'
  },
  end: {
    type: String,
    max: 30,
    label: 'When this event will end.'
  },
  validate: {
    type: Boolean,
    defaultValue: false,
  },
});

Events.attachSchema(Events.schema);

Events.publicFields = {
  giver: 1,
  receiver: 1,
  title: 1,
  start: 1,
  end: 1,
  validate: 1,
};
