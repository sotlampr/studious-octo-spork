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

    var user = Meteor.users.findOne({_id: userId});
    if ((user._id !== evnt.giverId)&&(user._id !== evnt.receiverId)) {
      throw new Meteor.Error('not-authorized');
    }

    if (evnt.giverId === userId) {
      Events.update({_id: eventId}, {$set: {giverValidated: true}});
    } else {
      Events.update({_id: eventId}, {$set: {receiverValidated: true}});
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
    start: { type: Date },
    end: { type: Date }
  }).validator(),

  run (data) {
    Events.insert({
      title: data.title,
      giverId: Meteor.users.findOne({username: data.giver})._id,
      receiverId: Meteor.users.findOne({username: data.receiver})._id,
      start: data.start,
      end: data.end,
      giverValidated: false,
      receiverValidated: true
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
    start: { type: Date },
    end: { type: Date },
    changer: { type: String }
  }).validator(),
  run (data) {
    var giverId = Meteor.users.findOne({username: data.giver})._id;
    var receiverId = Meteor.users.findOne({username: data.receiver})._id;
    if ((data.changer !== giverId) && (data.changer !== receiverId)) {
      throw new Meteor.Error(
        'events.editEvent.notAuthorized',
        'not-authorized'
      );
    }

    var flag = data.changer === giverId;
    Events.update({_id: data.id}, {$set: {
      title: data.title,
      giverId: giverId,
      receiverId: receiverId,
      start: data.start,
      end: data.end,
      giverValidated: flag,
      receiverValidated: !flag}
    });
  }
});
