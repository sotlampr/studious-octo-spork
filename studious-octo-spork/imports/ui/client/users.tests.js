import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';

import '../users.js';
import { withRenderedTemplate } from '../test-helpers.specs.js';
import { StubCollections } from '../test-helpers.specs.js';
import { generateUsers } from '../test-helpers.specs.js';

describe('Users', function() {
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

  describe('Users Index', function() {
    describe('Layout and Data', function() {
      it('Displays 3 default users', function(done) {
        const data = {
          users: Meteor.users.find()
        };
        withRenderedTemplate('usersIndex', data, el => {
          assert.equal($(el).find('#users li').length, 3);
        });
        done();
      });

      it('Displays name and occupation for all 3 default users', function(done) {
        withRenderedTemplate('usersIndex', {}, el => {
          let users = $(el).find('#users li p');
          for (let i=0; i < 3; i++) {
            assert.equal(
                users[i].innerText,
                usersData[i].username + ': ' + usersData[i].profile.occupation
            );
          }
        });
        done();
      });

      it('Displays results after searching for occupation', function(done) {
        Session.set('work', usersData[0].profile.occupation);
        withRenderedTemplate('usersIndex', {}, el => {
          let user = $(el).find('#searchResults li');
          assert.equal(
              user[0].innerText,
              usersData[0].username + ': ' + usersData[0].profile.occupation
          );
        });
        Session.set('work', '');
        done();
      });

      it('Displays results after searching for description', function(done) {
        Session.set('description', usersData[0].profile.description);
        withRenderedTemplate('usersIndex', {}, el => {
          let user = $(el).find('#searchResults li');
          assert.equal(user[0].innerText,
              usersData[0].username + ': ' + usersData[0].profile.occupation
          );
        });
        Session.set('description', '');
        done();
      });

      it('Default 3 occupations on occupations-tab', function(done) {
        withRenderedTemplate('usersIndex', {}, el => {
          assert.equal($(el).find('#occupations .nav-header').length, 3);
        });
        done();
      });

      it('Displays occupations after click on #occupations-tab', function(done) {
        withRenderedTemplate('usersIndex', {}, el => {
          assert.equal($(el).find('#users-tab').hasClass('in'), true);
          $(el).find('#occupationsTab')[0].click();
          assert.equal($(el).find('#users-tab').hasClass('in'), false);
        });
        done();
      });
    });

    describe('Redirects', function(){
      it('Clicking on a User redirects appropriately', function(done) {
        withRenderedTemplate('usersIndex', {}, el => {
          const users = $(el).find('ul#users').find('a');
          for (let i=0; i<3; i++) {
            users[i].click();
            assert.equal(
              decodeURIComponent(FlowRouter.current().path),
              '/users/' + encodeURIComponent(usersData[i].username)
            );
          }
        });
        done();
      });
    });
  });

  describe('User contact', function() {
    it('Do not display if not logged in', function(done) {
      withRenderedTemplate('usersContactByUsername', {}, el => {
        let text = $(el).find('h2').text();
        assert.equal(text, 'Sorry, you need to login to access this page');
      });
      done();
    });
  });
})

