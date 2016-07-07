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
      let userId;
      let eventId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: 'bolek'});
        eventId = Events.insert({
          title: 'Something',
          giverId: userId,
          receiverId: Random.id(),
          start: new Date(),
          end: new Date(),
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

      it('Validate a event request', function (done) {
        const validateRequest =
          Meteor.server.method_handlers['events.validateRequest'];
        const invocation = { userId };

        let count;
        validateRequest.apply(
          invocation,
          [{
            userId: userId,
            eventId: eventId
          }]
        );
        count = Events.find({giverValidated: true}).count();
        assert.equal(count, 1);
        done();
      });

      it('Reject validation with invalid userId', function (done) {
        const validateRequest =
          Meteor.server.method_handlers['events.validateRequest'];
        const invocation = { userId };
        const wrong = function () {
          validateRequest.apply(
            invocation,
            [{
              userId: Random.id(),
              eventId: eventId
            }]
          );
        };
        assert.throws(wrong, Meteor.Error);
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
      let userId;

      beforeEach(function (done) {
        userId = Accounts.createUser({username: 'dibaba'});
        done();
      });

      afterEach(function (done) {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Add a event', function (done) {
        const addRequest =
          Meteor.server.method_handlers['events.addRequest'];
        const invocation = { userId };

        let count;
        addRequest.apply(
          invocation,
          [{
            title: 'Triple at Rio',
            giver: Random.id(),
            receiver: userId,
            start: new Date(),
            end: new Date(),
          }]
        );
        count = Events.find({}).count();
        assert.equal(count, 1);
        done();
      });

      it('Reject addition with invalid userId', function (done) {
        const addRequest =
          Meteor.server.method_handlers['events.addRequest'];
        const invocation = {userId: Random.id()};
        const fault = function () {
          addRequest.apply(
            invocation,
            [{
              title: '1500m, 5K, 10K',
              giver: Random.id(),
              receiver: Random.id(),
              start: new Date(),
              end: new Date(),
            }]
          );
        };
        assert.throws(fault, Meteor.Error);
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
            changer: userId
          }]
        );

        let count = Events.find({receiverValidated: false}).count();
        assert.equal(count, 1);
        done();
      });

      it('Reject editing with invalic userId', function (done) {
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
