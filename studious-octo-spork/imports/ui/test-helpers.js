import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';

const SYMBOLS = _.keys(Mongo.Collection.prototype);

const withDiv = function withDiv(callback) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

export const withRenderedTemplate = function withRenderedTemplate(template, data, callback) {
  withDiv((el) => {
    const ourTemplate = _.isString(template) ? Template[template] : template;
    Blaze.renderWithData(ourTemplate, data, el);
    Tracker.flush();
    callback(el);
  });
};

const stubPair = function(pair) {
  SYMBOLS.forEach((symbol) => {
    sinon.stub(pair.collection, symbol, _.bind(pair.localCollection[symbol], pair.localCollection));
  });
};

const restorePair = function(pair) {
  SYMBOLS.forEach((symbol) => {
    pair.collection[symbol].restore();
  });
};

export const StubCollections = {
  _pairs: {},
  _collections: [],
  add(collections) {
    StubCollections._collections.push(...collections);
  },
  stub(collections) {
    collections = collections || StubCollections._collections;
    [].concat(collections).forEach((collection) => {
      if (!StubCollections._pairs[collection._name]) {
        const options = {transform: collection._transform};

        const pair = {
          localCollection: new collection.constructor(null, options),
          collection
        };

        stubPair(pair);
        StubCollections._pairs[collection._name] = pair;
      }
    });
  },
  restore: function() {
    _.each(StubCollections._pairs, restorePair);
    StubCollections._pairs = {};
  }
};
