/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Logbook } from './logbook.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Transactions logging', () => {
  });
};
