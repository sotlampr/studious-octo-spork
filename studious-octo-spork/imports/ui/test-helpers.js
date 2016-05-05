import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { Blaze } from 'meteor/blaze';
import { Tracker } from 'meteor/tracker';
import { Fake } from 'meteor/anti:fake';

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

export const generateUsers = (userCount) => {
  /* Function to generate an arbitary number of users.
   *  Usage:
   *    tempData = generateUsers(10);
   *    usersData = tempData.usersData;
   *    usersIdArray = tempData.usersIdArray;
   *
   *    Meteor.users.find() <-- Our fake users are there!!!
   *
   *  Side effect:
   *    Stubs Meteor.users and inserts the users in the stubbed database
   *  Returns:
   *    { usersData: Object, usersIdArray: Object }
   *    where usersData stores the user profiles (i.e. usersData[0].username])
   *    and usersIdArray stores the user Id's for later access
   */
  let usersData = [];
  let usersIdArray = [];

  StubCollections.stub(Meteor.users);
  for (let i=0; i < userCount; i++) {
    let tempData = {
      username: Fake.user({ fields: ['username'] }).username.split('@')[0],
      profile: {
        occupation: Fake.word(),
        description: Fake.sentence(3)
      }
    };
    usersData.push(tempData);
  }
  _.each(usersData, (data) => {
    usersIdArray.push(Meteor.users.insert(data));
  });

  return { usersData, usersIdArray };
};
