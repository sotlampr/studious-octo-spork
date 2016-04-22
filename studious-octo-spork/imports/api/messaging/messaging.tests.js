/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Messages } from './messaging.js';
import { saveMessage } from './methods.js';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isClient) {
  describe('Messaging', () => {
    describe('methods', () => {

      before( () => {
        resetDatabase();
      });

      after( () => {
        Meteor.logout();
        resetDatabase();
      });

      it('createUser()', () => {
        assert.equal(Meteor.users.find({'profile': {'occupation': 'hunter', 'description': 'birds'}}).count(), 1);
      });

      it('empty Messages db', () => {
        assert.equal(Messages.find().count(), 0);
      });

      it('userId()', () => {
        assert.notEqual(Meteor.userId(), null);
      });


      it('saveMessage()', () => {
        saveMessage.call({
          toId: Meteor.userId(),
          message: 'Where are you bolek, bolek asked himself',
        });

        assert.equal(Messages.find().count(), 1);
      });

    });
  });
}
