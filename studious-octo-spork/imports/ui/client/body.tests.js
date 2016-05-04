import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { FlowRouter } from 'meteor/kadira:flow-router';
import '../body.js';
import { withRenderedTemplate } from '../test-helpers.js';

describe('Home page', () => {
  beforeEach((done) => {
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach((done) => {
    Template.deregisterHelper('_');
    done();
  });

  it('Company name appears on footer', (done) => {
    withRenderedTemplate('App_body', {}, el => {
      let targetText = $(el).find('p#credits').text();
      assert.include(targetText, "touch_code");
      done();
    });
  });

  describe('Navigation bar', () => {
    it('click on Home', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#homePg')[0].click();
        assert.equal(FlowRouter.current().path, '/');
        done();
      });
    });

    it('click on About', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#aboutPg')[0].click();
        assert.equal(FlowRouter.current().path, '/about');
        done();
      });
    });

    it('click on Users', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#usersPg')[0].click();
        assert.equal(FlowRouter.current().path, '/users');
        done();
      });
    });

    it('click on Dashdoard', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#dashboardPg')[0].click();
        assert.equal(FlowRouter.current().path, '/dashboard');
        done();
      });
    });

    it('click on Contact', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#contactPg')[0].click();
        assert.equal(FlowRouter.current().path, '/contact');
        done();
      });
    });

    it('click on Sign Up / Sign In ', (done) => {
      withRenderedTemplate('App_body', {}, el => {
        $(el).find('#signUpInPg')[0].click();
        assert.equal(FlowRouter.current().path, '/register');
        done();
      });
    });
  });
});
