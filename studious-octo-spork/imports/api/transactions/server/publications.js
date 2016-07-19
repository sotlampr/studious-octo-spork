import { Meteor } from 'meteor/meteor';

import { Logbook } from '../logbook.js';


/* Publish entries that user is either giver or receiver,
 * only public fields.
 */
Meteor.publish('logbook.user', function userLogbook() {
  return Logbook.find(
      {$or: [{ giverId: this.userId }, { receiverId: this.userId }]},
      {fields: Logbook.publicFields}
  );
});
