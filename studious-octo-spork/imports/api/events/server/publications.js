import { Meteor } from 'meteor/meteor';

import { Events  } from '../events.js';

Meteor.publish('events', function eventsPublications() {
  return Events.find();
})
