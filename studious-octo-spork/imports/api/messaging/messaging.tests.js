/* eslint-env mocha */
import { Meteor } from 'meteor/meteor';
// import { resetDatabase } from 'meteor/xolvio:cleaner';
import { Messages } from './messaging.js';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';
// import { saveMessage } from './methods.js';
// import { toggleRead } from './methods.js';
// import { deleteMessage } from './methods';

require('./methods.js')

/* PARHS
if (Meteor.isClient) {
  describe('Messaging', () => {
    describe('methods', () => {

      it('createUser()', () => {
        assert.equal(Meteor.users.find({'profile': {'occupation': 'hunter', 'description': 'birds'}}).count(), 1);
      });

      it('empty Messages db', () => {
        assert.equal(Messages.find().count(), 0);
      });

      it('userId()', () => {
        assert.notEqual(Meteor.userId(), null);
      });


      it('saveMessage()', () => {
        saveMessage.call({
          toId: Meteor.userId(),
          message: 'Where are you bolek, bolek asked himself',
        });

        assert.equal(Messages.find().count(), 1);
      });

      it('message with read: false', () => {
        assert.equal(Messages.find({'read': false}).count(), 1)
      })

      it('toggleRead()', () => {
        toggleRead.call(Messages.find().fetch()[0]['_id']);
        assert.equal(Messages.find({'read': true}).count(), 1)
      })

      it('message with visible: true', () => {
        assert.equal(Messages.find({'visible': true}).count(), 1);
      });

      it('deleteMessage()', () => {
        deleteMessage.call(Messages.find().fetch()[0]['_id']);
        assert.equal(Messages.find({'visible': false}).count(), 1);
      });
    });
  });
}
*/

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
        }

        assert.throws(newMessageAttempt, Meteor.Error);

        done()

      });
    })
  })
}
