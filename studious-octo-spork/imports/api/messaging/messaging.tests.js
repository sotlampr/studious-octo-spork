/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
import { Messages } from './messaging.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

require('./methods.js');

if (Meteor.isServer) {
  describe('Messaging', () => {
    describe('saveMessage', () => {
      let userId;
      let toId;

      beforeEach((done) => {
        userId = Random.id();
        toId = Accounts.createUser({username: 'tester'});
        done();
      });

      afterEach((done) => {
        Meteor.users.remove({});
        Messages.remove({});
        done();
      });

      it('Save a message', (done) => {
        const saveMessage =
          Meteor.server.method_handlers['messaging.saveMessage'];
        const invocation = { userId };
        saveMessage.apply(invocation, [{
          toId: toId,
          message: "A test message"
        }]);
        assert.equal(Messages.find().count(), 1);
        done();
      });

      it('Reject message with invalid recipient', (done) => {
        const saveMessage =
          Meteor.server.method_handlers['messaging.saveMessage'];
        const invocation = { userId };
        const newMessageAttempt = () => {
          saveMessage.apply(invocation, [{
            toId: Random.id(),
            message: "A test message"
          }]);
        };
        assert.throws(newMessageAttempt, Meteor.Error);
        done();
      });
    });

    describe('toggleRead', () => {
      let messageId;
      let userId;

      beforeEach((done) => {
        userId = Random.id();
        messageId = Messages.insert({
          toId: userId,
          message: "A test message",
          fromId: Random.id(),
          dateCreated: new Date(),
          read: false,
          visible: true
        });
        done();
      });

      afterEach((done) => {
        Messages.remove({});
        done();
      });

      it('Toggle read 5 times test', (done) => {
        const toggleRead =
          Meteor.server.method_handlers['messaging.toggleRead'];
        const invocation = { userId };

        let readStatusBefore = Messages.findOne().read;
        let readStatusAfter;

        for (let i=0; i<5; i++) {
          toggleRead.apply(invocation, [messageId]);
          readStatusAfter = Messages.findOne().read;
          assert.equal(readStatusAfter, !readStatusBefore);
          readStatusBefore = readStatusAfter;
        }
        done();
      });

      it('Reject invalid message id', (done) => {
        const toggleRead =
          Meteor.server.method_handlers['messaging.toggleRead'];
        const invocation = { userId };
        const toggleAttempt = () => {
          toggleRead.apply(invocation, [Random.id()]);
        };
        assert.throws(toggleAttempt, Meteor.Error);
        done();
      });

      it('Reject unauthorized user', (done) => {
        const toggleRead =
          Meteor.server.method_handlers['messaging.toggleRead'];
        const invocation = { userId: Random.id() };
        const toggleAttempt = () => {
          toggleRead.apply(invocation, [messageId]);
        };
        assert.throws(toggleAttempt, Meteor.Error);
        done();
      });

     it('Reject toggle hidden message', (done) => {
        const toggleRead =
          Meteor.server.method_handlers['messaging.toggleRead'];
        const invocation = { userId };
        Messages.update({_id: messageId}, {$set: {visible: false}});
        const toggleAttempt = () => {
          toggleRead.apply(invocation, [messageId]);
        };
        assert.throws(toggleAttempt, Meteor.Error);
        done();
      });
    });

  describe('deleteMessage', () => {
      let messageId;
      let userId;

      beforeEach((done) => {
        userId = Random.id();
        messageId = Messages.insert({
          toId: userId,
          message: "A test message",
          fromId: Random.id(),
          dateCreated: new Date(),
          read: false,
          visible: true
        });
        done();
      });

      afterEach((done) => {
        Messages.remove({});
        done();
      });

      it('Hide a message', (done) => {
        const deleteMessage =
          Meteor.server.method_handlers['messaging.deleteMessage'];
        const invocation = { userId };

        deleteMessage.apply(invocation, [messageId]);
        assert.equal(Messages.find({visible: true}).count(), 0);
        done();
      });

      it('Reject removing an already removed message', (done) => {
        const deleteMessage =
          Meteor.server.method_handlers['messaging.deleteMessage'];
        const invocation = { userId };
        const deleteAttempt = () => {
          deleteMessage.apply(invocation, [messageId]);
        };
        // Delete the message for real
        deleteAttempt();
        assert.throws(deleteAttempt, Meteor.Error);
        done();
      });

      it('Reject invalid message id', (done) => {
        const deleteMessage =
          Meteor.server.method_handlers['messaging.deleteMessage'];
        const invocation = { userId };
        const deleteAttempt = () => {
          deleteMessage.apply(invocation, [Random.id()]);
        };
        assert.throws(deleteAttempt, Meteor.Error);
        done();
      });

      it('Reject unauthorized user', (done) => {
        const deleteMessage =
          Meteor.server.method_handlers['messaging.deleteMessage'];
        const invocation = { userId: Random.id() };
        const deleteAttempt = () => {
          deleteMessage.apply(invocation, [messageId]);
        };
        assert.throws(deleteAttempt, Meteor.Error);
        done();
      });
    });
  });
}
