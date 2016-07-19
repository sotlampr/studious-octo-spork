import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Logbook } from './logbook.js';


/* Return a transaction if exists, else
 * throw an appropriate error.
 */
function tryFetchTransaction (transactionId, userId) {
  let transaction = Logbook.findOne(transactionId);

  // Check if transaction exists
  if (transaction === null)
    throw new Meteor.Error('transactions.transactionNotFound');

  // Caller should be either giver or receiver
  if (
    (transaction.fromId !== userId) &&
    (transaction.toId !== userId)
  ){
    throw new Meteor.Error('transactions.notAuthorized');
  }

  // If we got so far, everything is ok
  return transaction;
};

/* Propagate transaction info to users balance.
 * 2 options for arg type:
 *  final:
 *    Register the transaction on users' real balance
 *  logistic:
 *    Register the transaction on users' logistic balance
 */

function commitTransaction (transaction, type) {
  if (type === 'final') {
    Meteor.users.update(
        { _id: transaction.giverId },
        { $inc: {
          'profile.balance': -transaction.cost,
          'profile.logisticBalance': transaction.cost
        }}
    );
    Meteor.users.update(
        { _id: transaction.receiverId },
        { $inc: {
          'profile.balance': transaction.cost,
          'profile.logisticBalance': -transaction.cost
        }}
    );
  } else if (type === 'logistic') {
    Meteor.users.update(
        { _id: transaction.giverId },
        { $inc: { 'profile.logisticBalance': -transaction.cost } }
    );
    Meteor.users.update(
        { _id: transaction.receiverId },
        { $inc: { 'profile.logisticBalance': transaction.cost } }
    );
  } else {
    // TODO Unrecongized type, do nothing?
  }
};

/* Insert a new transaction
 * data keys:
 *   giverId, giverValidated:
 *     meteor userId of the user calling this function and a boolean
 *     declaring if this is the giver.
 *   reveiverId, reveiverValidated:
 *     meteor userId of the opposite party and a boolean declaring if
 *     the user calling this function is the receiver.
 *      NOTE:
 *        giverId = CURRENT USER
 *        receiverId = OTHER PARTY
 *        so, if receiverOk === true, flip giverId and receiverId.
 *   description:
 *     String, short description.
 *   cost:
 *     Number, represents cost.
 */
export const saveTransaction = new ValidatedMethod({
  name: 'transactions.saveTransaction',
  validate: new SimpleSchema({
    giverValidated: { type: Boolean },
    receiverValidated: { type: Boolean },
    giverId: { type: String },
    receiverId: { type: String },
    description: { type: String },
    cost: { type: Number },
  }).validator(),
  run (data) {
    if (data.giverId !== this.userId) {
      throw new Meteor.Error('transactions.saveTransaction.notAuthorized');
    }

    // Cannot have a negative cost value!
    if (data.cost <= 0) {
      throw new Meteor.Error(
        'transactions.saveTransaction.zeroCost',
        'Transaction cost should not be zero or negative'
      );
    }

    // Giver represents employer, so flip if necessary
    if (data.receiverValidated && !data.giverValidated) {
      // giverId is receiver, flip
      [data.giverId, data.receiverId] = [data.receiverId, data.giverId];
    } else if (!data.receiverValidated && data.giverValidated) {
      // already in correct position
    } else {
      throw new Meteor.Error(
        'transactions.saveTransaction.noRelationshishippSelected',
        'No work relationship selected.'
      );
    }

    // Check for available balance
    let employer= Meteor.users.findOne({ _id: data.giverId});
    let fromBalance = employer.profile.balance + employer.profile.logisticBalance;
    let difference = fromBalance - data.cost;
    if (difference < -100) {
      throw new Meteor.Error(
        'transactions.saveTransaction.notEnoughBalance',
        'Target balance is not enough to cover the cost.'
      );
    }

    data.date = new Date();
    let transactionId = Logbook.insert(data);
    commitTransaction(Logbook.findOne({ _id: transactionId }), 'logistic');
  },
});

/* Let the other party approve a registered transaction.
 * args:
 *   transactionId:
 *     Mongo Id of the transaction.
 */
export const approveTransaction = new ValidatedMethod({
  name: 'transactions.approveTransaction',
  validate: new SimpleSchema({
    transactionId: { type: String },
  }).validator(),
  run (data) {
    let target = tryFetchTransaction(data.transactionId);

    // User calling should not have already approved this transaction
    if ((target.giverId === this.userId && target.giverValidated) ||
        (target.receiverId === this.userId && target.receiverValidated))
      throw new Meteor.Error('transactions.approveTransaction.notAuthorized');

    // Go on and set the unapproved flag to true
    if (!target.giverValidated)
      Logbook.update({_id: data.transactionId},
                     {$set: {giverValidated: true}});
    else if (!target.receiverValidated)
      Logbook.update({_id: data.transactionId},
                     {$set: {receiverValidated: true}});

    commitTransaction(target, 'final');
  }
});

/* Delete a registered transaction.
 * args:
 *   transactionId:
 *     Mongo Id of the transaction.
 */
export const deleteTransaction = new ValidatedMethod({
  name: 'transactions.deleteTransaction',
  validate: new SimpleSchema({
    transactionId: { type: String },
  }).validator(),
  run (data) {
    let target = tryFetchTransaction(data.transactionId);

    if (target.giverOk && target.receiverOk)
      throw new Meteor.Error('transactions.deleteTransaction.alreadyCommited');

    if (target.giverValidated)
      Logbook.update({_id: data.transactionId},
                     {$set: {giverValidated: false}});
    else if (target.receiverValidated)
      Logbook.update({_id: data.transactionId},
                     {$set: {receiverValidated: false}});

    target.cost = -target.cost;
    commitTransaction(target, 'logistic');
  }
});
