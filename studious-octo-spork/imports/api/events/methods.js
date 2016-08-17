import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Events } from './events.js';


/* Propagate transaction info to users balance.
 * 2 options for arg type:
 *  final:
 *    Register the transaction on users' real balance
 *  logistic:
 *    Register the transaction on users' logistic balance
 */

function commitTransaction (data, type) {
  if (type === 'final') {
    Meteor.users.update(
        { _id: data.giverId },
        { $inc: {
          'profile.balance': data.cost,
          'profile.logisticBalance': -data.cost
        }}
    );
    Meteor.users.update(
        { _id: data.receiverId },
        { $inc: {
          'profile.balance': -data.cost,
          'profile.logisticBalance': data.cost
        }}
    );
  } else if (type === 'logistic') {
    Meteor.users.update(
        { _id: data.giverId },
        { $inc: { 'profile.logisticBalance': data.cost } }
    );
    Meteor.users.update(
        { _id: data.receiverId },
        { $inc: { 'profile.logisticBalance': -data.cost } }
    );
  } else {
    // TODO Unrecongized type, do nothing?
  }
}

/* Check if a user has the required balance to do a transaction,
 * and if not raise an appropriate error.
 * args:
 *   userId:
 *     Mongo _id of the user to check
 *   cost:
 *     Target transaction cost
 */
function checkUserBalance (userId, cost) {
  // Cannot have a negative cost value!
    if (cost <= 0) {
      throw new Meteor.Error(
        'events.checkUserBalance.zeroCost',
        'Transaction cost should not be zero or negative'
      );
    }

  // Check for available balance
  let employer= Meteor.users.findOne({ _id: userId });
  let fromBalance = employer.profile.balance + employer.profile.logisticBalance;
  let difference = fromBalance - cost;
  if (difference < -100) {
    throw new Meteor.Error(
      'events.checkUserBalance.notEnoughBalance',
      'Target balance is not enough to cover the cost.'
    );
  }
}


/*  Validate an event (userId, eventId)
 *  args:
 *    userId:
 *      Mongo _id of the user
 *    eventId:
 *      Mongo _id of the event
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
        'events.validateRequest.not-authorized',
        'You have not the right'
      );
    }


    if (evnt.giverId === userId) {
      if (evnt.giverValidated) {
        throw new Meteor.Error(
          'events.validateRequest.already-validated',
          'You have already validated this event'
          );
      }
      Events.update({_id: eventId}, {$set: {giverValidated: true}});
    } else {
      if (evnt.receiverValidated) {
        throw new Meteor.Error(
          'events.validateRequest.already-validated',
          'You have already validated this event'
          );
      }
      Events.update({_id: eventId}, {$set: {receiverValidated: true}});
    }

    // Commit the transaction on users' real balance
    commitTransaction(evnt, 'final');
  },
});



/*  Remove an event (eventId)
 *  args:
 *    eventId:
 *      Mongo _id of the event
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


/*  Add an event (title, giver, receiver, start, end)
 *  args:
 *    title:
 *      String, the title of the event
 *    giver:
 *      Mongo _id of the giver
 *    receiver:
 *      Mongo _id of the receiver
 *    start:
 *      Date, the start date
 *    end:
 *      Date, the end date
 */
export const addRequest = new ValidatedMethod({
  name: 'events.addRequest',

  validate: new SimpleSchema({
    title: { type: String },
    giver: { type: String },
    receiver: { type: String },
    start: { type: Date },
    end: { type: Date },
    cost: { type: Number }
  }).validator(),

  run (data) {
    if (this.userId !== data.receiver) {
      throw new Meteor.Error('not-authorized');
    }

    checkUserBalance(data.receiver, data.cost);

    let eventId = Events.insert({
      title: data.title,
      giverId: data.giver,
      receiverId: data.receiver,
      start: data.start,
      end: data.end,
      cost: data.cost,
      giverValidated: false,
      receiverValidated: true
    });

    commitTransaction(Events.findOne({ _id: eventId }), 'logistic');
  }
});


/*  Edit an event (id, giver, receiver, start, end, changer)
 *  args:
 *    id:
 *      Mongo _id of the event
 *    giver:
 *      Mongo _id of the giver
 *    receiver:
 *      Mongo _id of the receiver
 *    start:
 *      Date, the start date
 *    end:
 *      Date, the end date
 *    changer:
 *      Mongo _id of the user who changed the event
 *    cost:
 *      Cost of the transaction
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
    changer: { type: String },
    cost: { type: Number }
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
      cost: data.cost,
      giverValidated: flag,
      receiverValidated: !flag}
    });
  }
});
