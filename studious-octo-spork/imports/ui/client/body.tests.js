import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '../body.js';

const withDiv = function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

const withRenderedTemplate = function withRenderedTemplate(template, data, callback) {
  withDiv((el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Blaze.renderWithData(ourTemplate, data, el);
    Tracker.flush();
    callback(el);
  });
};

describe('Home page', () => {
  beforeEach(() => {
    Template.registerHelper('_', key => key);
  });

  afterEach(() => {
    Template.deregisterHelper('_');
  });

  it('Company name appears on footer', () => {
    withRenderedTemplate('App_body', {}, el => {
      let targetText = $(el).find('p#credits').text();
      assert.include(targetText, "touch_code");
    });
  });
});
