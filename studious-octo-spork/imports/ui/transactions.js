import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Logbook } from '../api/transactions/logbook.js';
import { approveTransaction } from '../api/transactions/methods.js';
import { deleteTransaction } from '../api/transactions/methods.js';

import './transactions.html';

const approvalStatusToContextualClass = {
  both: 'info',
  'self': 'success',
  other: 'warning',
  none: 'danger'
};

const transactionApprovalStatus = (data) => {
  // Return transaction approval status as a string
  // 4 Possible return values:
  //   ['both', 'self', 'other', 'none']
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
  this.subscribe('logbook.user');
  this.subscribe('users');
});

Template.transactionsIndex.events({
  // TO FILL
});

Template.transactionsIndex.helpers({
  usernameFromId: function (id) {
    let user = Meteor.users.findOne(id);
    if (user)
      return user.username;
  },
  userTransactions: function () {
    if (Meteor.user()) {
      var userTransactions = Logbook.find(
          {}, {sort: {date: -1}, limit: 15}
      );
      return userTransactions;
    }
  },
  contextualApprovalStatus: (data) => {
    return approvalStatusToContextualClass[transactionApprovalStatus(data)];
  },
  canDelete: (giverValidated, receiverValidated) => {
    let state = transactionApprovalStatus(data);
    if (state === 'self' || state === 'other')
      return true;
    else
      return false;
  }
});

Template.renderActions.helpers({
  isCompleted: (data) => {
    if (transactionApprovalStatus(data) === 'both') return true;
    else return false;
  },
  hasApproved: (data) => {
    if (transactionApprovalStatus(data) === 'self') return true;
    else return false;
  },
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
