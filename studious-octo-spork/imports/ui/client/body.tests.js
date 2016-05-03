import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

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
});
