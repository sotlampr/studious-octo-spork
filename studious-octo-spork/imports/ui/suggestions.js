import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Suggestions = new Mongo.Collection('suggestions');
Suggestions.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Suggestions.schema = new SimpleSchema({
  suggestion: {
    type: String,
    max: 30,
  },
});

Suggestions.attachSchema(Suggestions.schema);

Suggestions.publicFields = {
  suggestion: 1,
};

var occupations = [
  'engineer',
  'doctor',
  'architect',
  'lawyer',
  'trainer',
  'teacher',
  'babysitter',
  'dancer',
  'chef',
  'barber',
  'builder',
  'cleaner',
  'transporter',
  'fisherman',
  'mechanic',
  'author',
  'electrician',
  'plumber',
  'blacksmith',
  'accountant',
  'clown',
  'glazier',
  'dustman',
  'gardener',
  'baker',
  'painter',
  'driver',
  'nurse',
  'waiter',
  'programmer',
  'masseur',
];

if (Suggestions.find().count() === 0 ) {
  for (let i=0; i<occupations.length; i++) {
    Suggestions.insert({suggestion: occupations[i]});
  }
}
