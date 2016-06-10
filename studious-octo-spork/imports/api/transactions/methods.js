import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Logbook } from './logbook.js';

const commitTransaction = function(transaction, type) {
  if (type === 'final') {
    Meteor.users.update(
        { _id: transaction.giverId },
        { $inc: {
          'profile.balance': -transaction.cost ,
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
    // do nothing?
  }
};

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

    // From represents employer, so flip if necessary
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

    // Check for availabl balance
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

export const approveTransaction = new ValidatedMethod({
  name: 'transactions.approveTransaction',
  validate: new SimpleSchema({
    targetUserId: { type: String },
    targetTransactionId: { type: String },
    targetOk: { type: Boolean }
  }).validator(),
  run (data) {
    if (data.targetUserId !== this.userId)
      throw new Meteor.Error('transactions.approveTransaction.notAuthorized');

    let transaction = Logbook.findOne(data.targetTransactionId);
    if (!transaction.giverValidated)
      Logbook.update({_id: data.targetTransactionId}, {$set: {giverValidated: true}});
    else if (!transaction.receiverValidated)
      Logbook.update({_id: data.targetTransactionId}, {$set: {receiverValidated: true}});

    commitTransaction(transaction, 'final');
  }
});

export const deleteTransaction = new ValidatedMethod({
  name: 'transactions.deleteTransaction',
  validate: new SimpleSchema({
    targetTransactionId: { type: String },
  }).validator(),
  run (data) {
    let transaction = Logbook.findOne(data.targetTransactionId);
    if (
      (transaction.giverId !== this.userId) &&
      (transaction.receiverId !== this.userId)
    )
      throw new Meteor.Error('transactions.approveTransaction.notAuthorized');

    if (transaction.giverValidated)
      Logbook.update({_id: data.targetTransactionId}, {$set: {giverValidated: false}});
    else if (transaction.receiverValidated)
      Logbook.update({_id: data.targetTransactionId}, {$set: {receiverValidated: false}});
  }
});
