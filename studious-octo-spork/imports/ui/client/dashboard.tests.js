import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Random } from 'meteor/random';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { sinon } from 'meteor/practicalmeteor:sinon';
import { Fake } from 'meteor/anti:fake';

import '../dashboard.js';
import { Messages } from '../../api/messaging/messaging.js';
import { withRenderedTemplate } from '../test-helpers.specs.js';
import { StubCollections } from '../test-helpers.specs.js';
import { generateUsers } from '../test-helpers.specs.js';
import { Events } from '../../api/events/events.js';

describe('Dashboard', function() {
  let usersData;
  let usersIdArray;

  beforeEach(function(done) {
    tempUsers = generateUsers(3);
    usersIdArray = tempUsers.usersIdArray;
    usersData = tempUsers.usersData;
    done();
  });

  afterEach(function(done) {
    StubCollections.restore();
    Template.deregisterHelper('_');
    done();
  });

  it('Prompt for login if unresgistered', function(done) {
    withRenderedTemplate('dashboard', {}, el => {
      let targetText = $(el).find('h4').text();
      assert.include(targetText, "You are not registered yet.");
      done();
    });
  });

  describe('Messages', function() {
    it('Display 3 messages', function(done) {
      let rawMessages = [];
      // Generate random messages
      for (let i=0; i<3; i++) {
        tempData = {
          receiverId: usersIdArray[0],
          giverId: usersIdArray[i%2+1],
          message: Fake.sentence(5),
          dateCreated: new Date(),
          read: false,
          visible: true
        };
        rawMessages.push(tempData);
      }
      StubCollections.stub(Messages);
      _.each(rawMessages, (data) => {
        Messages.insert(data);
      });

      // Pesudologin as a user
      sinon.stub(Meteor, 'userId', () => { return usersIdArray[0]; });
      sinon.stub(Meteor, 'user', () => {
        return Meteor.users.findOne(usersIdArray[0]);
      });

      withRenderedTemplate('dashboard', {}, el => {
        let messages = $(el).find('.message');
        assert.equal(messages.length, 3);
        for (let i=0; i<3; i++) {
          assert.equal(
            messages[i].innerText.replace(/\s+/g, ' '),
            ' ' + Meteor.users.findOne(rawMessages[i].giverId).username +
              ' ' + rawMessages[i].dateCreated +
              ' ' + rawMessages[i].message + ' '
          );
        }
      });
      Meteor.userId.restore();
      Meteor.user.restore();
      done();
    });

    it('Do not display invisible message', function(done) {
      StubCollections.stub(Messages);
      Messages.insert({
        receiverId: usersIdArray[0],
        giverId: usersIdArray[1],
        message: Fake.sentence(5),
        dateCreated: new Date(),
        read: false,
        visible:false
      });

      sinon.stub(Meteor, 'userId', () => { return usersIdArray[0]; });
      sinon.stub(Meteor, 'user', () => {
        return Meteor.users.findOne(usersIdArray[0]);
      });

      withRenderedTemplate('dashboard', {}, el => {
        let messages = $(el).find('.message');
        assert.equal(messages.length, 0);
      });
      Meteor.userId.restore();
      Meteor.user.restore();
      done();
    });
  });

  describe('Events Requests', function() {
    it('Display 3 events requests', function(done) {
      let rawEventsRequests = [];
      // Generate random events requests
      for (let i=0; i<3; i++) {
        tempData = {
          giverId: usersIdArray[i%2+1],
          receiverId: usersIdArray[0],
          title: Fake.sentence(3),
          start: new Date(),
          end: new Date(),
          giverValidated: false,
          receiverValidated: true
        };
        rawEventsRequests.push(tempData);
      }
      StubCollections.stub(Events);
      _.each(rawEventsRequests, (data) => {
        Events.insert(data);
      });

      // Pesudologin as a user
      sinon.stub(Meteor, 'userId', () => { return usersIdArray[0]; });
      sinon.stub(Meteor, 'user', () => {
        return Meteor.users.findOne(usersIdArray[0]);
      });

      withRenderedTemplate('dashboard', {}, el => {
        let trs = $(el).find('tbody tr');
        assert.equal(trs.length, 3);
      });

      Meteor.userId.restore();
      Meteor.user.restore();
      done();
    });
  });
});
