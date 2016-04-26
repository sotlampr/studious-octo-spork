/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Messages } from './messaging.js';
import { saveMessage } from './methods.js';
import { toggleRead } from './methods.js';
import { deleteMessage } from './methods';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isClient) {
  describe('Messaging', () => {
    describe('methods', () => {

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

      it('message with read: false', () => {
        assert.equal(Messages.find({'read': false}).count(), 1)
      })

      it('toggleRead()', () => {
        toggleRead.call(Messages.find().fetch()[0]['_id']);
        assert.equal(Messages.find({'read': true}).count(), 1)
      })

      it('message with visible: true', () => {
        assert.equal(Messages.find({'visible': true}).count(), 1);
      });

      it('deleteMessage()', () => {
        deleteMessage.call(Messages.find().fetch()[0]['_id']);
        assert.equal(Messages.find({'visible': false}).count(), 1);
      });
    });
  });
}
