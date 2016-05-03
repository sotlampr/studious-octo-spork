import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Random } from 'meteor/random';
import { $ } from 'meteor/jquery';
import { sinon } from 'meteor/practicalmeteor:sinon';

import '../dashboard.js';
import { Messages } from '../../api/messaging/messaging.js';
import { withRenderedTemplate } from '../test-helpers.js';
import { StubCollections } from '../test-helpers.js';
import { generateUsers } from '../test-helpers.js';

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
      let targetText = $(el).find('p').text();
      assert.include(targetText, "You are not registered yet.");
      done();
    });
  });

  it('Display appropriate data when logged in', function (done) {
    sinon.stub(Meteor, 'userId', () => { return usersIdArray[0]; });
    withRenderedTemplate('dashboard', {}, el => {
      assert.equal($(el).find('#username').val(), usersData[0].username);
      assert.equal($(el).find('#occupation').val(), usersData[0].profile.occupation);
      assert.equal($(el).find('#description').val(), usersData[0].profile.description);
    });
    Meteor.userId.restore();
    done();
  });

  it('Display messages', function (done) {
    sinon.stub(Meteor, 'userId', () => { return usersIdArray[0]; });
    sinon.stub(Meteor, 'user', () => {
      return Meteor.users.findOne(usersIdArray[0]);
    });
    StubCollections.stub(Messages);
    Messages.insert({
      toId: usersIdArray[0],
      fromId: usersIdArray[1],
      message: "A test message",
      dateCreated: new Date(),
      read: false,
      visible: true
    });

    withRenderedTemplate('dashboard', {}, el => {
      assert.equal(
        $(el).find('#message').text().replace(/\s+/g, ' '),
        ' ' + usersData[1].username + ': A test message '
      );
    });
    Meteor.userId.restore();
    done();
  });
});
