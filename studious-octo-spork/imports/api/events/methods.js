import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Events } from './events.js';


/*  When an user click on validateRequest button, the
*   method set the corresponding event field true
*/
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
      throw new Meteor.Error(
        'events.validateRequest.event-not-found',
        'Event not found'
      );
    }

    var user = Meteor.users.findOne({_id: userId});

    if (!user||(
        (user._id !== evnt.giverId)&&
        (user._id !== evnt.receiverId) )) {
      throw new Meteor.Error(
        'events.validtateRequest.not-authorized',
        'You have not the right'
      );
    }

    if (evnt.giverId === userId) {
      Events.update({_id: eventId}, {$set: {giverValidated: true}});
    } else {
      Events.update({_id: eventId}, {$set: {receiverValidated: true}});
    }
  },
});


/*  When an user click on removeRequest button, the
*   method remove the event from events collection
*/
export const removeRequest = new ValidatedMethod({
  name: 'events.removeRequest',

  validate: new SimpleSchema({
    eventId: { type: String },
  }).validator(),

  run (data) {
    var id = data.eventId;
    var evnt = Events.findOne({_id: id});

    if (!evnt) {
      throw new Meteor.Error(
        'events.removeRequest.event-not-found',
        'Event not found'
      );
    }

    if ((this.userId !== evnt.giverId)&&
        (this.userId !== evnt.receiverId)) {
      throw new Meteor.Error(
        'events.removeRequest.you-havenot-the-right',
        'You have not the right'
      );
    }

    Events.remove({_id: id});
  },
});


/*  After submit Add Event Request form the method
*   takes the inputs and insert an entry in events collection
*/
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
    if (this.userId !== data.receiver) {
      throw new Meteor.Error('not-authorized');
    }

    Events.insert({
      title: data.title,
      giverId: data.giver,
      receiverId: data.receiver,
      start: data.start,
      end: data.end,
      giverValidated: false,
      receiverValidated: true
    });
  }
});


/*  After submit Edit Event form the method
*   takes the inputs and update the corresponding entry
*/
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
    var giverId = data.giver;
    var receiverId = data.receiver;
    var changerId = data.changer;

    if ((changerId !== giverId) && (changerId !== receiverId)) {
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
