import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

import '../users.js';
import { withRenderedTemplate } from '../test-helpers.js';
import { StubCollections } from '../test-helpers.js';

describe('Users page', () => {
  let usersData;

  beforeEach((done) => {
    StubCollections.stub(Meteor.users);
    usersData = ([
      {
        username: 'bill',
        profile: {
          occupation: 'mechanic'
        }
      },
      {
        username: 'john',
        profile: {
          occupation: 'artist'
        }
      },
      {
        username: 'mary',
        profile: {
          occupation: 'martial arts'
        }
      }
    ]);
    _.each(usersData, (data) => {
      Meteor.users.insert(data);
    });
    // Template.registerHelper('_', key => key);
    done();
  });

  afterEach((done) => {
    StubCollections.restore();
    Template.deregisterHelper('_');
    done();
  });

  it('Displays 3 default users', (done) => {
    const data = {
      users: Meteor.users.find()
    };
    withRenderedTemplate('usersIndex', data, el => {
      assert.equal($(el).find('li').length, 3);
    });
    done();
  });

  it('Displays name and occupation for all 3 default users', () => {
    withRenderedTemplate('usersIndex', {}, el => {
      let users = $(el).find('li');
      assert.equal(users[0].innerText, 'bill: mechanic');
      assert.equal(users[1].innerText, 'john: artist');
      assert.equal(users[2].innerText, 'mary: martial arts');
    });
  });
});
