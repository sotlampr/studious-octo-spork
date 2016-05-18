import { Meteor } from 'meteor/meteor';

import { Logbook } from '../messaging.js';

Meteor.publish('logbook.user', function userLogbook() {
  return Logbook.find({toId: this.userId}, {fields: Logbook.publicFields});
})
