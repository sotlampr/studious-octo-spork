/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai'

import { Messages } from './messaging.js'
import { saveMessage } from './methods.js';

if (Meteor.isServer) {
  describe('Messaging', () => {
    describe('methods', () => {
      const userIdTo = Random.id();
      const userIdFrom = Random.id();
      let messageId;

      beforeEach(() => {
        Messages.remove({});
        // Provide a data object for creating new entries
        data = {
          to: userIdTo,
          from: userIdFrom,
          message: 'test message',
          dateCreated: new Date(),
          read: false,
          visible: true
        }
        // Create a new entry by default
        messageId = Messages.insert(data);
      });

      it('can insert a new message', () => {
        saveMessage._execute({ userIdFrom }, { data });
        assert.isNotNone(Messages.findOne({to: userIdFrom}),
            "messaging.saveMessage did not insert a new message");
      });
    });
  });
}
