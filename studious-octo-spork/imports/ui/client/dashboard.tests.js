import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Random } from 'meteor/random';
import { $ } from 'meteor/jquery';

import '../dashboard.js';
import { withRenderedTemplate } from '../test-helpers.js';
import { StubCollections } from '../test-helpers.js';

describe('Dashboard', function() {
  beforeEach((done) => {
    Template.registerHelper('_', key => key);
    done();
  });

  afterEach(function(done) {
    Template.deregisterHelper('formData');
    done();
  });

  it('Prompt for login if unresgistered', function(done) {
    withRenderedTemplate('dashboard', {}, el => {
      let targetText = $(el).find('p').text();
      assert.include(targetText, "You are not registered yet.");
      done();
    });
  });
});
