/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { updateUserProfile } from './methods.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

/* PARHS
if (Meteor.isClient) {

  describe('Update user profile', () => {
    describe('methods', () => {

      Accounts.createUser({
        "username": 'jack',
        "password": '1234',
        'profile': {
          'occupation': 'hunter',
          'description': 'birds'
        }
      });

      it('createUser()', () => {
        assert.equal(Meteor.users.find({'profile': {'occupation': 'hunter', 'description': 'birds'}}).count(), 1);
      });

      it('userId()', () => {
        assert.notEqual(Meteor.userId(), null);
      });

      it('updateUserProfile()', () => {

        updateUserProfile.call({
          id: Meteor.userId(),
          username: 'jack',
          occupation: 'friend',
          description: '4-legs'
        });

        assert.equal(Meteor.users.find({'profile': {'occupation': 'friend', 'description': '4-legs'}}).count(), 1);
      });
    });
  });

}
*/
