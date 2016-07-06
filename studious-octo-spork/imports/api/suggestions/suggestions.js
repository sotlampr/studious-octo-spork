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
