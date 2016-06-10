import { Meteor } from 'meteor/meteor';

import { Logbook } from '../logbook.js';

Meteor.publish('logbook.user', function userLogbook() {
  return Logbook.find(
      {$or: [{ giverId: this.userId }, { receiverId: this.userId }]},
      {fields: Logbook.publicFields}
  );
});
