/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

// These are Chimp globals
/* globals browser assert server */

describe('Acceptance Tests', function () {
  beforeEach(function () {
    browser.url('http://localhost:3000');
  });

  it('Our Fancy name in the navbar @watch', function () {
    assert.equal(
      browser.getText('a.navbar-brand'),
      "Studious Octo Spork"
    );
  });
});
