/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Events } from './events.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');


if (Meteor.isServer) {
  describe('Events', function () {
    describe('validateRequest', function () {
      let giverId, receiverId, eventId, data;
      const invokeValidateAs = function(userId, data) {
       const validateRequest =
          Meteor.server.method_handlers['events.validateRequest'];
        const invocation = { userId };
        validateRequest.apply(invocation, [ data ]);
      };


      beforeEach(function (done) {
        giverId = Accounts.createUser({username: 'testGiver'});
        receiverId = Accounts.createUser({username: 'testReceiver'});
        eventId = Events.insert({
          title: 'Something',
          giverId: giverId,
          receiverId: receiverId,
          start: new Date(),
          end: new Date(),
          cost: 100,
          giverValidated: false,
          receiverValidated: true
        });
        data = {
          userId: giverId,
          eventId: eventId
        };
        Meteor.users.update({ _id: giverId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 100}
        });
        Meteor.users.update({ _id: receiverId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': -100}
        });
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Validate an event request', function (done) {
        invokeValidateAs(giverId, data);
        count = Events.find({giverValidated: true}).count();
        assert.equal(count, 1);
        done();
      });

      it('Reject validation for unauthorized userId', function (done) {
        data.userId = Random.id();
        let invocationAttempt = function() {
          invokeValidateAs(giverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject already validated request (giver)', function (done) {
        let invocationAttempt = function() {
          invokeValidateAs(giverId, data);
        };
        Events.update({_id: eventId}, {$set: {giverValidated: true}});
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject already validated request (receiver)', function (done) {
        data.userId = receiverId;
        let invocationAttempt = function() {
          invokeValidateAs(receiverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Restore logistic balance on validation', function (done) {
        invokeValidateAs(giverId, data);
        assert.equal(
            Meteor.users.findOne({ _id: giverId }).profile.logisticBalance,
            0.0
        );
        assert.equal(
            Meteor.users.findOne({ _id: receiverId }).profile.logisticBalance,
            0.0
        );
        done();
      });

      it('Modify real balance on validation', function (done) {
        invokeValidateAs(giverId, data);
        assert.equal(
            Meteor.users.findOne({ _id: giverId }).profile.balance,
            100.0
        );
        assert.equal(
            Meteor.users.findOne({ _id: receiverId }).profile.balance,
            -100.0
        );
        done();
      });
    });

    describe('removeRequest', function () {
      let userId;
      let eventId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: 'lolek'});
        eventId = Events.insert({
          title: 'Else',
          giverId: userId,
          receiverId: Random.id(),
          start: new Date(),
          end: new Date(),
          cost: 100,
          giverValidated: false,
          receiverValidated: true
        });
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Remove a event', function (done) {
        const removeRequest =
          Meteor.server.method_handlers['events.removeRequest'];
        const invocation = { userId };

        let count;
        removeRequest.apply(invocation, [{eventId: eventId}]);
        count = Events.find({}).count();
        assert.equal(count, 0);
        done();
      });

      it('Reject removing with invalid userId', function (done) {
        const removeRequest =
          Meteor.server.method_handlers['events.removeRequest'];
        const invocation = {userId: Random.id()};
        const fail = function () {
          removeRequest.apply(invocation, [{eventId: eventId}]);
        };
        assert.throws(fail, Meteor.Error);
        done();
      });
    });

    describe('addRequest', function () {
      let receiverId, giverId, data;
      const invokeAddAs = function(userId, data) {
       const addRequest =
          Meteor.server.method_handlers['events.addRequest'];
        const invocation = { userId };
        addRequest.apply(invocation, [ data ]);
      };


      beforeEach(function (done) {
        giverId = Accounts.createUser({username: 'testGiver'});
        receiverId = Accounts.createUser({username: 'testReceiver'});
        data = {
          title: 'Triple at Rio',
          giver: giverId,
          receiver: receiverId,
          start: new Date(),
          end: new Date(),
          cost: 100,
        };
        Meteor.users.update({ _id: giverId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 0}
        });
        Meteor.users.update({ _id: receiverId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 0}
        });
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Add an event', function (done) {
        invokeAddAs(receiverId, data);
        count = Events.find({}).count();
        assert.equal(count, 1);
        done();
      });

      it('Modify logistic balance on new transaction', function(done) {
        invokeAddAs(receiverId, data);
        assert.equal(
            Meteor.users.findOne({ _id: giverId }).profile.logisticBalance,
            100.0
        );
        assert.equal(
            Meteor.users.findOne({ _id: receiverId }).profile.logisticBalance,
            -100.0
        );
        done();
      });


      it('Reject addition with invalid userId', function (done) {
        let invocationAttempt = function () {
          invokeAddAs(Random.id(), data)
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject transaction user cannot pay', function(done) {
        data.cost = 101;
        let invocationAttempt = function () {
          invokeAddAs(receiverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject transaction user cannot pay (cumulative)', function(done) {
        data.cost = 51;
        invokeAddAs(receiverId, data);
        let invocationAttempt = function () {
          invokeAddAs(receiverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });
    });

    describe('editEvent', function () {
      let userId;
      let who = Random.id();
      let eventId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: 'fuji'});
        eventId = Events.insert({
          title: 'feather',
          giverId: userId,
          receiverId: who,
          start: new Date(),
          end: new Date(),
          cost: 100,
          giverValidated: true,
          receiverValidated: true
        });
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Edit a event', function (done) {
        const editEvent =
          Meteor.server.method_handlers['events.editEvent'];
        const invocation = { userId };

        editEvent.apply(
          invocation,
          [{
            id: eventId,
            title: 'Fixed',
            giver: userId,
            receiver: who,
            start: new Date(),
            end: new Date(),
            changer: userId,
            cost: 120
          }]
        );

        let count = Events.find({receiverValidated: false}).count();
        assert.equal(count, 1);
        done();
      });

      it('Reject editing with invalid userId', function (done) {
        const editEvent =
          Meteor.server.method_handlers['events.editEvent'];
        const invocation = {userId: Random.id()};
        const xi = function () {
          editEvent.apply(
            invocation,
            [{
              id: eventId,
              title: 'Gear',
              giver: userId,
              receiver: who,
              start: new Date(),
              end: new Date(),
              changer: Random.id()
            }]
          );
        };
        assert.throws(xi, Meteor.Error);
        done();
      });
    });
  });
}
