/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Random } from 'meteor/random';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');


if (Meteor.isServer) {
  describe('Users', function () {
    describe('updateUserProfile', function () {
      let userId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: "tester"});
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        done();
      });

      it('Update user profile', function (done) {
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

      it('Reject update another user profile', function (done) {
        const updateUserProfile =
          Meteor.server.method_handlers['users.updateUserProfile'];
        const invocation = { userId };
        const updateAttempt = function () {
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


    describe('editUserProfile', function () {
      let userId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: "mofarah"});
        Meteor.users.update({username: 'mofarah'}, {$set: {
          'profile.occupation': 'robot',
          'profile.description': 'virtual runner',
          'emails.0.address': 'gomofarah@co.uk',
          'emails.0.verified': true,
          characteristic: 'mobot',
          'profile.avatarType': 'retro'}
        });
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        done();
      });

      it('Edit user profile', function (done) {
        const editUserProfile =
          Meteor.server.method_handlers['users.editUserProfile'];
        const invocation = { userId };
        editUserProfile.apply(invocation, [{
          id: userId,
          username: 'mo',
          occupation: 'athlete',
          description: 'long distance',
          email: 'gomo@co.uk',
          characteristic: 'yeaz',
          avatarType: 'identicon'
        }]);

        user = Meteor.users.findOne();
        assert.equal(user.username, 'mo');
        assert.equal(user.profile.occupation, 'athlete');
        assert.equal(user.profile.description, 'long distance');
        assert.equal(user.emails[0].address, 'gomo@co.uk');
        assert.equal(user.emails[0].verified, false);
        assert.equal(user.characteristic, 'yeaz');
        assert.equal(user.profile.avatarType, 'identicon');
        done();
      });

      it('Reject edit another user profile', function (done) {
        const editUserProfile =
          Meteor.server.method_handlers['users.editUserProfile'];
        const invocation = { id: Random.id() };
        const not = function () {
          editUserProfile.apply(invocation, [{
            id: userId,
            username: 'muktar',
            occupation: 'run',
            description: 'marathon',
            email: 'go@co.uk',
            characteristic: 'zzzzzz',
            avatarType: 'retro'
          }]);
        };

        assert.throws(not, Meteor.Error);
        done();
      });

      it('Reject change username if already exists', function (done) {
        Meteor.users.insert({username: 'mohamed'});
        const editUserProfile =
          Meteor.server.method_handlers['users.editUserProfile'];
        const invocation = { userId };
        const error = function () {
          editUserProfile.apply(invocation, [{
            id: userId,
            username: 'mohamed',
            occupation: 'runner',
            description: '1500, 3K, 5K, 10K, half marathon, marathon',
            email: 'mofarah@co.uk',
            characteristic: 'celebration move',
            avatarType: 'wavatar'
          }]);
        };

        assert.throws(error, Meteor.Error);
        done();
      });
    });

    describe('deleteAccount', function () {
      let userId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: "mofarah"});
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        done();
      });

      it('Delete an account', function (done) {
        const deleteAccount =
          Meteor.server.method_handlers['users.deleteAccount'];
        const invocation = { userId };

        let num;
        deleteAccount.apply(invocation, [{id: userId}]);
        num = Meteor.users.find({}).count();
        assert.equal(num, 0);
        done();
      });

      it('Reject delete another user account', function (done) {
        const deleteAccount =
          Meteor.server.method_handlers['users.deleteAccount'];
        const invocation = { id: Random.id() };
        const throwing = function () {
          deleteAccount.apply(invocation, [{id: userId}]);
        };
        assert.throws(throwing, Meteor.Error);
        done();
      });
    });
  });
}
