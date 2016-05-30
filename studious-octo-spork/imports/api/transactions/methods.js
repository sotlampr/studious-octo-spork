import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Logbook } from './logbook.js';

export const saveTransaction = new ValidatedMethod({
  name: 'transactions.saveTransaction',
  validate: new SimpleSchema({
    fromOk: { type: Boolean },
    toOk: { type: Boolean },
    fromId: { type: String },
    toId: { type: String },
    description: { type: String },
    cost: { type: Number },
  }).validator(),
  run (data) {
    if (data.fromId !== this.userId) {
      throw new Meteor.Error('transactions.saveTransaction.notAuthorized');
    }

    if (data.cost <= 0) {
      throw new Meteor.Error(
        'transactions.saveTransaction.zeroCost',
        'Transaction cost should not be zero or negative'
      );
    }
    // from represents employer, so flip if necessary
    if (data.toOk && !data.fromOk) {
      // fromId is worker, flip
      [data.fromId, data.toId] = [data.toId, data.fromId];
    } else if (!data.toOk && data.fromOk) {
      // already in correct position
    } else {
      throw new Meteor.Error(
        'transactions.saveTransaction.noRelationshishippSelected',
        'No work relationship selected.'
      );
    }
    let fromBalance = Meteor.users.findOne({ _id: data.fromId}).profile.balance;
    let difference = fromBalance - data.cost;
    if (difference < -100) {
      throw new Meteor.Error(
        'transactions.saveTransaction.notEnoughBalance',
        'Target balance is not enough to cover the cost.'
      );
    }
    data.date = new Date();
    Logbook.insert(data);
  },
});

export const approveTransaction = new ValidatedMethod({
  name: 'transactions.approveTransaction',
  validate: new SimpleSchema({
    targetUser: { type: String },
    targetTransaction: { type: String },
    targetOk: { type: Boolean }
  }).validator(),
  run (data) {
    if (data.targetUser !== this.userId) {
      throw new Meteor.Error('transactions.approveTransaction.notAuthorized');
    }
    let transaction = Logbook.findOne(data.targetTransaction);
    if (!transaction.fromOk) {
      Logbook.update({_id: data.targetTransaction}, {$set: {fromOk: true}});
    } else if (!transaction.toOk) {
      Logbook.update({_id: data.targetTransaction}, {$set: {toOk: true}});
    }
    Meteor.users.update(
        { _id: transaction.fromId },
        { $inc: { 'profile.balance': -transaction.cost }}
    );
    Meteor.users.update(
        { _id: transaction.toId },
        { $inc: { 'profile.balance': transaction.cost }}
    );
  }
});
