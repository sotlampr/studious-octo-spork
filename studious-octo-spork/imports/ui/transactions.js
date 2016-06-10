import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Logbook } from '../api/transactions/logbook.js';
import { approveTransaction } from '../api/transactions/methods.js';
import { deleteTransaction } from '../api/transactions/methods.js';

import './transactions.html';

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
  contextualApprovalStatus: (giverValidated, receiverValidated) => {
    if (giverValidated && receiverValidated)
      return 'info';
    else if (giverValidated || receiverValidated)
      return 'warning';
    else
      return 'danger';
  },
  canDelete: (giverValidated, receiverValidated) => {
    // XOR
    if ((giverValidated || receiverValidated) && !(giverValidated && receiverValidated))
      return true;
    else
      return false;
  }
});

Template.renderApprovalStatus.helpers({
  equals: function(a, b) {
    return a === b;
  },
});

Template.renderApprovalStatus.events({
  'click #approve': function(event) {
    approveTransaction.call(this);
  }
});

Template.renderDeleteTransaction.events({
  'click #delete-transaction': (event, template) => {
    deleteTransaction.call(template.data);
  }
});
