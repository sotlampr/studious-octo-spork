import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Events = new Mongo.Collection('events');

Events.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Events.schema = new SimpleSchema({
  userA: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  userB: {
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
    max: 50,
    label: 'When this event will start.'
  },
  end: {
    type: String,
    label: 'When this event will end.'
  }
});

Events.attachSchema(Events.schema);

Events.publicFields = {
  userA: 1,
  userB: 1,
  title: 1,
  start: 1,
  end: 1,
};
