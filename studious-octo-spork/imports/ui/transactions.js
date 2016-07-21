import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Logbook } from '../api/transactions/logbook.js';
import { approveTransaction } from '../api/transactions/methods.js';
import { deleteTransaction } from '../api/transactions/methods.js';

import './transactions.html';
import './common-helpers.js';


/* Object with possible transaction states:
 * both / self / other / none
 * for using with contetual bootstrap classes
 */
const approvalStatusToContextualClass = {
  both: 'info',
  'self': 'success',
  other: 'warning',
  none: 'danger'
};

/* Return transaction approval status as a string
 * 4 Possible return values:
 *   both
 *     Both users have approved the transaction.
 *   self
 *     Caller has approved, the other party's approval is pending.
 *   other
 *     The other party has approved, caller approval is pending.
 *   none
 *     No-one has approved this transaction (which means it has been deleted)
 */
const transactionApprovalStatus = (data) => {
  // Expand the data to variables for readability
  let user = Meteor.userId();
  let u1 = {id: data.giverId, ok: data.giverValidated};
  let u2 = {id: data.receiverId, ok: data.receiverValidated};

  if (u1.ok && u2.ok) return 'both';
  else if (((user === u1.id) && u1.ok) ||
           ((user === u2.id) && u2.ok)) return 'self';
  else if (u1.ok || u2.ok) return 'other';
  else return 'none';
};

Template.transactionsIndex.onCreated(function transactionsIndexOnCreated() {
  // Required subscriptions
  this.subscribe('logbook.user');
  this.subscribe('users');
});

Template.transactionsIndex.events({
  // TO FILL
});

Template.transactionsIndex.helpers({
  // Return last 15 transactions for current user
  userTransactions: function () {
    if (Meteor.user()) {
      var userTransactions = Logbook.find(
          {}, {sort: {date: -1}, limit: 15}
      );
      return userTransactions;
    }
  },

  // Return the context according to approval status
  contextualApprovalStatus: (data) => {
    return approvalStatusToContextualClass[transactionApprovalStatus(data)];
  },

  // Return a boolean indicating if the transaction is disputable
  canDelete: (giverValidated, receiverValidated) => {
    let state = transactionApprovalStatus(data);
    if (state === 'self' || state === 'other')
      return true;
    else
      return false;
  }
});

Template.renderActions.helpers({
  // return true if both approved
  isCompleted: (data) => {
    if (transactionApprovalStatus(data) === 'both') return true;
    else return false;
  },
  // return true if caller has approved
  hasApproved: (data) => {
    if (transactionApprovalStatus(data) === 'self') return true;
    else return false;
  },
  // return true if caller's approval is pending
  awaitingApproval: (data) => {
    if (transactionApprovalStatus(data) === 'other') return true;
    else return false;
  },
});

Template.renderActions.events({
  'click #approve-transaction': (event, template) => {
    approveTransaction.call({ transactionId: template.data._id });
  },
  'click #delete-transaction': (event, template) => {
    deleteTransaction.call({ transactionId: template.data._id });
  }
});
