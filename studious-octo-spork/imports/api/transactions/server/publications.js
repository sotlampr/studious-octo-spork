import { Meteor } from 'meteor/meteor';

import { Logbook } from '../logbook.js';

Meteor.publish('logbook.user', function userLogbook() {
  return Logbook.find(
      {$or: [{ employerId: this.userId }, { workerId: this.userId }]},
      {fields: Logbook.publicFields}
  );
})
