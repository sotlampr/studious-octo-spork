/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Logbook } from './logbook.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Transactions', () => {
    describe('saveTransaction', function () {
      // Helper variables and functions
      let userId;
      let toId;
      let data;

      const invokeSaveAs = function(userId, data) {
       const saveTransaction =
          Meteor.server.method_handlers['transactions.saveTransaction'];
        const invocation = { userId };
        saveTransaction.apply(invocation, [data]);
      };

      // Before and after routines
      beforeEach((done) => {
        userId = Accounts.createUser({username: 'tester1'});
        toId = Accounts.createUser({username: 'tester2'});
        data = {
          fromOk: true,
          toOk: false,
          fromId: userId,
          toId: toId,
          description: "test transaction",
          cost: 100.0
        };
        Meteor.users.update({ _id: userId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 0}
        });
        Meteor.users.update({ _id: toId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 0}
        });
        done();
      });

      afterEach((done) => {
        Meteor.users.remove({});
        Logbook.remove({});
        done();
      });


      it('Save a new transaction', function(done) {
        invokeSaveAs(userId, data);
        assert.equal(Logbook.find().count(), 1);
        done();
      });

      it('Reject transaction with invalid userId', function(done) {
        let invocationAttempt = function () {
          invokeSaveAs(toId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject a transaction noone approved', function(done) {
        data.fromOk = false;
        let invocationAttempt = function () {
          invokeSaveAs(userId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject a transaction both users approved', function(done) {
        data.toOk = true;
        let invocationAttempt = function () {
          invokeSaveAs(userId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject transaction user cannot pay', function(done) {
        data.cost = 101;
        let invocationAttempt = function () {
          invokeSaveAs(userId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject transaction user cannot pay (cumulative)', function(done) {
        data.cost = 51;
        invokeSaveAs(userId, data);
        let invocationAttempt = function () {
          invokeSaveAs(userId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Test transaction as employer', function(done) {
        invokeSaveAs(userId, data);
        let entry = Logbook.findOne();
        assert.equal(entry.fromId, userId);
        done();
      });

      it('Test transaction as worker', function(done) {
        data.toOk = true;
        data.fromOk = false;
        invokeSaveAs(userId, data);
        let entry = Logbook.findOne();
        assert.equal(entry.toId, userId);
        done();
      });
    });

    describe('approveTransaction', function () {
      let transactionId;
      let userId;
      let toId;
      let data;

      const invokeApproveAs = function (userId, data) {
        const approveTransaction =
          Meteor.server.method_handlers['transactions.approveTransaction'];
        const invocation = { userId };
        approveTransaction.apply(invocation, [data]);
      };

      beforeEach((done) => {
        userId = Random.id();
        toId = Random.id();
        transactionId = Logbook.insert({
          fromOk: true,
          toOk: false,
          fromId: userId,
          toId: toId,
          description: "test transaction",
          cost: 100.0,
          date: new Date(),
        });
        data = {
          targetUserId: userId,
          targetTransactionId: transactionId,
          targetOk: true
        };
        done();
      });

      afterEach((done) => {
        Logbook.remove({});
        done();
      });

      it('Approve a transaction', function(done) {
        invokeApproveAs(userId, data);
        let transaction = Logbook.findOne();
        assert.isTrue(transaction.toOk);
        done();
      });

      it('Reject approval with invalid userId', function(done) {
        let invocationAttempt = function () {
          invokeApproveAs(toId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });


    });
  });
}
