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
      let receiverId;
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
        receiverId = Accounts.createUser({username: 'tester2'});
        data = {
          giverValidated: true,
          receiverValidated: false,
          giverId: userId,
          receiverId: receiverId,
          description: "test transaction",
          cost: 100.0
        };
        Meteor.users.update({ _id: userId}, {$set:
          {'profile.balance': 0, 'profile.logisticBalance': 0}
        });
        Meteor.users.update({ _id: receiverId}, {$set:
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
          invokeSaveAs(receiverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject a transaction noone approved', function(done) {
        data.giverValidated = false;
        let invocationAttempt = function () {
          invokeSaveAs(userId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });

      it('Reject a transaction both users approved', function(done) {
        data.receiverValidated = true;
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
        assert.equal(entry.giverId, userId);
        done();
      });

      it('Test transaction as worker', function(done) {
        data.receiverValidated = true;
        data.giverValidated = false;
        invokeSaveAs(userId, data);
        let entry = Logbook.findOne();
        assert.equal(entry.receiverId, userId);
        done();
      });
    });

    describe('approveTransaction', function () {
      let transactionId;
      let userId;
      let receiverId;
      let data;

      const invokeApproveAs = function (userId, data) {
        const approveTransaction =
          Meteor.server.method_handlers['transactions.approveTransaction'];
        const invocation = { userId };
        approveTransaction.apply(invocation, [data]);
      };

      beforeEach((done) => {
        userId = Random.id();
        receiverId = Random.id();
        transactionId = Logbook.insert({
          giverValidated: true,
          receiverValidated: false,
          giverId: userId,
          receiverId: receiverId,
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
        assert.isTrue(transaction.receiverValidated);
        done();
      });

      it('Reject approval with invalid userId', function(done) {
        let invocationAttempt = function () {
          invokeApproveAs(receiverId, data);
        };
        assert.throws(invocationAttempt, Meteor.Error);
        done();
      });


    });
  });
}
