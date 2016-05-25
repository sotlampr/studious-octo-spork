/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Logbook } from './logbook.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Transactions', () => {
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
      userId = Random.id();
      toId = Accounts.createUser({username: 'tester'});
      data = {
        fromOk: true,
        toOk: false,
        fromId: userId,
        toId: toId,
        description: "test transaction",
        cost: 100.
      };

      done();
    });

    afterEach((done) => {
      Meteor.users.remove({});
      Logbook.remove({});
      done();
    });

    // Tests
    it('Save a new transaction', function(done) {
      invokeSaveAs(userId, data);
      assert.equal(Logbook.find().count(), 1);
      done();
    })
  });
};
