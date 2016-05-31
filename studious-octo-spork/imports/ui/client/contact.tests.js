import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '../contact.js';
import { withRenderedTemplate } from '../test-helpers.specs.js';

describe('Contact page', () => {
  beforeEach((done) => {
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach((done) => {
    Template.deregisterHelper('_');
    done();
  });

  it('Title contact form on h3', (done) => {
    withRenderedTemplate('contact', {}, el => {
      let targetText = $(el).find('h3.text-center').text();
      assert.include(targetText, "CONTACT");
      done();
    });
  });
});
