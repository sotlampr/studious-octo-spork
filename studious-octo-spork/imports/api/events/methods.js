import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Events } from './events.js';

export const validateRequest = new ValidatedMethod({
  name: 'events.validateRequest',
  validate: new SimpleSchema({
    userId: { type: String },
    eventId: { type: String },
  }).validator(),
  run (data) {
    var userId = data.userId;
    var eventId = data.eventId;

    var evnt = Events.findOne({_id: eventId});
    if (!evnt) {
      throw new Meteor.Error('event-not-found');
    }

    if (!Meteor.users.findOne({_id: userId})) {
      throw new Meteor.Error('user-not-found');
    }

    if (evnt.giver === userId) {
      Events.update({_id: eventId}, {$set: {giverValidation: true}});
    } else {
      Events.update({_id: eventId}, {$set: {receiverValidation: true}});
    }
  },
});

export const removeRequest = new ValidatedMethod({
  name: 'events.removeRequest',
  validate: new SimpleSchema({
    eventId: { type: String },
  }).validator(),
  run (data) {
    var id = data.eventId;
    if (!Events.findOne({_id: id})) {
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
      giverValidation: false,
      receiverValidation: true
    });
  }
});

export const editEvent = new ValidatedMethod({
  name: 'events.editEvent',
  validate: new SimpleSchema({
    id: { type: String },
    title: { type: String },
    giver: { type: String },
    receiver: { type: String },
    start: { type: String },
    end: { type: String },
    changer: { type: String }
  }).validator(),
  run (data) {
    var flag = data.changer === Meteor.users.findOne({username: data.giver})._id;
    Events.update({_id: data.id}, {$set: {
      title: data.title,
      giver: Meteor.users.findOne({username: data.giver})._id,
      receiver: Meteor.users.findOne({username: data.receiver})._id,
      start: data.start,
      end: data.end,
      giverValidation: flag,
      receiverValidation: !flag}
    });
  }
});
