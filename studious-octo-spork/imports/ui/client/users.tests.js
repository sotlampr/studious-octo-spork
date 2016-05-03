import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

import '../users.js';
import { withRenderedTemplate } from '../test-helpers.js';
import { StubCollections } from '../test-helpers.js';
import { generateUsers } from '../test-helpers.js';

describe('Users page', () => {
  let usersData;
  let usersIdArray;

  beforeEach(function(done) {
    let tempUsers = generateUsers(3);
    usersData = tempUsers.usersData;
    usersIdArray = tempUsers.usersIdArray;
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach(function(done) {
    StubCollections.restore();
    Template.deregisterHelper('_');
    done();
  });

  it('Displays 3 default users', function(done) {
    const data = {
      users: Meteor.users.find()
    };
    withRenderedTemplate('usersIndex', data, el => {
      assert.equal($(el).find('li').length, 3);
    });
    done();
  });

  it('Displays name and occupation for all 3 default users', function(done) {
    withRenderedTemplate('usersIndex', {}, el => {
      let users = $(el).find('li');
      for (let i=0; i < 3; i++) {
        assert.equal(
            users[i].innerText,
            usersData[i].username + ': ' + usersData[i].profile.occupation
        );
      }
    });
    done();
  });
});
