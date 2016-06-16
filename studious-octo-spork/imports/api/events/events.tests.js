/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Events } from './events.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Events', () => {
    describe('validateRequest', () => {
      let userId;
      let eventId;

      beforeEach((done) => {
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

      afterEach((done) => {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Validate a event request', (done) => {
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

      it('Reject validation event from not authorized user', (done) => {
        const validateRequest =
          Meteor.server.method_handlers['events.validateRequest'];
        const invocation = { userId };
        const wrong = () => {
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

    describe('removeRequest', () => {
      let userId;
      let eventId;

      beforeEach((done) => {
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

      afterEach((done) => {
        Meteor.users.remove({});
        Events.remove({});
        done();
      });

      it('Remove a event', (done) => {
        const removeRequest =
          Meteor.server.method_handlers['events.removeRequest'];
        const invocation = { userId };

        let count;
        removeRequest.apply(invocation, [{eventId: eventId}]);
        count = Events.find({}).count();
        assert.equal(count, 0);
        done();
      });

      it('Reject removing event from not authorized user', (done) => {
        const removeRequest =
          Meteor.server.method_handlers['events.removeRequest'];
        const invocation = {userId: Random.id()};
        const fail = () => {
          removeRequest.apply(invocation, [{eventId: eventId}]);
        };
        assert.throws(fail, Meteor.Error);
        done();
      });
    });
  });
}
