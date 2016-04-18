/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai'

import { Messages } from './messaging.js'
import { saveMessage } from './methods.js';

if (Meteor.isServer) {
  describe('Messaging', () => {
    describe('methods', () => {
    });
  });
};
