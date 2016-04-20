/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { updateUserProfile } from './methods.js';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isClient) {

  describe('Update user profile', () => {
    describe('methods', () => {

      beforeEach( () => {
        resetDatabase();
      });

      it('updateUserProfile', () => {

        Accounts.createUser({
          "username": 'jack',
          "password": '1234',
          'profile': {
            'occupation': 'hunter',
            'description': 'birds'
          }
        }, function (err) {
          if (err) {
            console.log(err);
          }
          else {
            Meteor.loginWithPassword('jack', '1234', function (e) {
              if (e) {
                console.log(e);
              }
            });
          }
        });

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
