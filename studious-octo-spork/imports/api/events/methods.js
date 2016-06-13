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
    if (data.title === '') {
      throw new Meteor.Error(
        'events.addEvent.emptyTitle',
        'The title is empty'
      );
    }

    if (moment(data.start).format() === 'Invalid date') {
      throw new Meteor.Error(
        'events.addEvent.invalidStartDate',
        'Invalid Event Start date format'
      );
    }

    if (moment(data.end).format() === 'Invalid date') {
      throw new Meteor.Error(
        'events.addEvent.invalidEndDate',
        'Invalid Event End date format'
      );
    }

    var today = moment().format();
    if (moment(today).isAfter(data.start)) {
      throw new Meteor.Error(
        'events.addEvent.startDateBeforeToday',
        'Event Start should be after today'
      );
    }

    if (moment(today).isAfter(data.end)) {
      throw new Meteor.Error(
        'events.addEvent.endDateBeforeToday',
        'Event End should be after today'
      );
    }

    if (moment(data.start).isAfter(data.end)||moment(data.start).isSame(data.end)) {
      throw new Meteor.Error(
        'events.addEvent.startDateSameOrAfterEndDate',
        'Event End should be after Event Start'
      );
    }

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

    if (data.title === '') {
      throw new Meteor.Error(
        'events.editEvent.emptyTitle',
        'The title is empty'
      );
    }

    if (moment(data.start).format() === 'Invalid date') {
      throw new Meteor.Error(
        'events.editEvent.invalidStartDate',
        'Invalid Event Start date format'
      );
    }

    if (moment(data.end).format() === 'Invalid date') {
      throw new Meteor.Error(
        'events.editEvent.invalidEndDate',
        'Invalid Event End date format'
      );
    }

    var today = moment().format();
    if (moment(today).isAfter(data.start)) {
      throw new Meteor.Error(
        'events.editEvent.startDateBeforeToday',
        'Event Start should be after today'
      );
    }

    if (moment(today).isAfter(data.end)) {
      throw new Meteor.Error(
        'events.editEvent.endDateBeforeToday',
        'Event End should be after today'
      );
    }

    if (moment(data.start).isAfter(data.end)||moment(data.start).isSame(data.end)) {
      throw new Meteor.Error(
        'events.editEvent.startDateSameOrAfterEndDate',
        'Event End should be after Event Start'
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
