/* eslint-env mocha */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Users', () => {
    let userId;

    beforeEach((done) => {
      userId = Accounts.createUser({username: "tester"});
      done();
    });

    afterEach((done) => {
      Meteor.users.remove({});
      done();
    });

    it('Update user profile', (done) => {
      const updateUserProfile =
        Meteor.server.method_handlers['users.updateUserProfile'];
      const invocation = { userId };
      updateUserProfile.apply(invocation, [{
        id: userId,
        username: 'testerer',
        occupation: 'Newist',
        description: 'Cutting-edge'
      }]);
      userObject = Meteor.users.findOne();
      assert.equal(userObject.username, 'testerer');
      assert.equal(userObject.profile.occupation, 'Newist');
      assert.equal(userObject.profile.description, 'Cutting-edge');
      done();
    });
    it('Reject update another user profile', (done) => {
      const updateUserProfile =
        Meteor.server.method_handlers['users.updateUserProfile'];
      const invocation = { userId };
      const updateAttempt = () => {
        updateUserProfile.apply(invocation, [{
          id: Random.Id,
          username: 'testerer',
          occupation: 'Newist',
          description: 'Cutting-edge'
        }]);
      };
      assert.throws(updateAttempt, Meteor.Error);
      done();
    });
  });
}
