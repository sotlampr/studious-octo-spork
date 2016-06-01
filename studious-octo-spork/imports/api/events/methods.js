import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Events } from './events.js';

export const addEvent = new ValidatedMethod({
  name: 'events.addEvent',
  validate: new SimpleSchema({
    eventId: { type: String },
  }).validator(),
  run (data) {
    var id = data.eventId
    if (!Events.findOne(id)) {
      throw new Meteor.Error('event-not-found');
    }
    Events.update({_id: id}, {$set: {validate: true}});
  },
});

export const removeRequest = new ValidatedMethod({
  name: 'events.removeRequest',
  validate: new SimpleSchema({
    eventId: { type: String },
  }).validator(),
  run (data) {
    var id = data.eventId;
    if (!Events.findOne(eventId)) {
      throw new Meteor.Error('event-not-found');
    }
    Events.remove({_id: id});
  },
});
