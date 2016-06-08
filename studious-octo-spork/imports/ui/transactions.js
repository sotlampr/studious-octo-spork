import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './transactions.html';

Template.transactionsIndex.onCreated(function transactionsIndexOnCreated() {
  this.subscribe('logbook.user');
});

Template.transactionsIndex.events({
  // TOFILL
});

Template.transactionsIndex.helpers({
  // TOFILL
});
