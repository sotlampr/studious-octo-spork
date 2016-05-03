import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Random } from 'meteor/random';
import { $ } from 'meteor/jquery';
import { sinon } from 'meteor/practicalmeteor:sinon';

import '../dashboard.js';
import { withRenderedTemplate } from '../test-helpers.js';
import { StubCollections } from '../test-helpers.js';

describe('Dashboard', function() {
  let usersData;
  let usersIdArray;

  beforeEach((done) => {
    StubCollections.stub(Meteor.users);
    usersIdArray = []
    usersData = ([
      {
        username: 'bill',
        profile: {
          occupation: 'mechanic',
          description: 'Je suis un mechanic'
        }
      },
      {
        username: 'john',
        profile: {
          occupation: 'artist',
          description: 'John Ross'
        }
      },
      {
        username: 'mary',
        profile: {
          occupation: 'martial arts',
          description: 'Exarcheia resident'
        }
      }
    ]);
    _.each(usersData, (data) => {
      usersIdArray.push(Meteor.users.insert(data));
    });
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach((done) => {
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
    sinon.stub(Meteor, 'userId', () => { return usersIdArray[0] });
    withRenderedTemplate('dashboard', {}, el => {
      assert.equal($(el).find('#username').val(), usersData[0].username);
      assert.equal($(el).find('#occupation').val(), usersData[0].profile.occupation);
      assert.equal($(el).find('#description').val(), usersData[0].profile.description);
    });
    done();
  });
});
