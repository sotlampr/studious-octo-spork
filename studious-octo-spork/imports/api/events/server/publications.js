import { Meteor } from 'meteor/meteor';
import { Events  } from '../events.js';

Meteor.publish('events', function eventsPublications() {
  return Events.find({
    $or: [
      {
        $or: [
          {giverId: this.userId},
          {receiverId: this.userId}
        ]
      },
      {
        $and: [
          {giverValidated: true},
          {receiverValidated: true}
        ]
      }
    ]
  });
})
