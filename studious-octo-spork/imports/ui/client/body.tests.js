import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { FlowRouter } from 'meteor/kadira:flow-router';
import '../body.js';
import { withRenderedTemplate } from '../test-helpers.specs.js';

describe('Home page', function() {
  beforeEach(function(done) {
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach(function(done) {
    Template.deregisterHelper('_');
    done();
  });

  it('Company name appears on footer', function(done) {
    withRenderedTemplate('App_body', {}, el => {
      let targetText = $(el).find('p#credits').text();
      assert.include(targetText, "touch_code");
    });
    done();
  });

  describe('Navigation bar', function() {
    it('Clicking on Home redirects to "/"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#homePg')[0].click();
        assert.equal(FlowRouter.current().path, '/');
      });
      done();
    });

    it('Clicking on About redirects to "/about"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#aboutPg')[0].click();
        assert.equal(FlowRouter.current().path, '/about');
      });
      done();
    });

    it('Clicking on Users redirects to "/users"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#usersPg')[0].click();
        assert.equal(FlowRouter.current().path, '/users');
      });
      done();
    });

    it('Clicking on Dashdoard redirects to "/dashboard"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#dashboardPg')[0].click();
        assert.equal(FlowRouter.current().path, '/dashboard');
      });
      done();
    });

    it('Clicking on Contact redirects to "/#contact"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#contactPg')[0].click();
        assert.equal(FlowRouter.current().path, '/#contact');
      });
      done();
    });

    it('Clicking on Sign Up / Sign In redirects to "/register"', function(done) {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#signUpInPg')[0].click();
        assert.equal(FlowRouter.current().path, '/register');
      });
      done();
    });
  });
});
