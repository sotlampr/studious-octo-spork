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
    if (!Events.findOne(id)) {
      throw new Meteor.Error('event-not-found');
    }
    Events.remove({_id: id});
  },
});

export const addRequest = new ValidatedMethod({
  name: 'events.addRequest',
  validate: new SimpleSchema({
    title: { type: String },
    giver: { type: String },
    receiver: { type: String },
    start: { type: String },
    end: { type: String }
  }).validator(),
  run (data) {
    Events.insert({
      title: data.title,
      giver: Meteor.users.findOne({username: data.giver})._id,
      receiver: Meteor.users.findOne({username: data.receiver})._id,
      start: data.start,
      end: data.end,
      validate: false
    });
  }
});
