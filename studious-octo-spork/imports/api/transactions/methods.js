import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Logbook } from './logbook.js';

export const saveTransaction = new ValidatedMethod({
  name: 'transactions.saveTransaction',
  validate: new SimpleSchema({
    employerOk: { type: Boolean },
    workerOk: { type: Boolean },
    fromUsername: { type: String },
    toUsername: { type: String },
    description: { type: String },
    cost: { type: Number },
  }).validator(),
  run (data) {
    let fromId = Meteor.users.findOne({ username: data.fromUsername })._id;
    let toId = Meteor.users.findOne({ username: data.toUsername })._id;

    if (fromId !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // from represents employer, so flip if necessary
    if (data.workerOk && !data.employerOk) {
      // fromId is worker, flip
      [fromId, toId] = [toId, fromId];
    } else if (!data.workerOk && data.employerOk) {
      // already in correct position
    } else {
      throw new Meteor.Error('input-error');
    }

    // Process the data to be compatible with Logbook
    data.employerId = fromId;
    data.workerId = toId;
    data.date = new Date;
    delete data.fromUsername;
    delete data.toUsername;
    Logbook.insert(data);
  },
});
