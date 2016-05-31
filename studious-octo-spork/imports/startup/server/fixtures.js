import { Meteor } from 'meteor/meteor';
import { Suggestions } from '../../api/users/suggestions.js';

let occupations = [
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

Meteor.startup(function () {
  // code to run on server at startup
  // USERNAME: Complete email address (website@gmail.com)
  // PASSWORD: Email password (gmail password)
  // HOST: Smtp server address (for gmail is smtp.gmail.com, for hotmail is smtp.live.com, ...)
  process.env.MAIL_URL = 'smtp://USERNAME:PASSWORD@HOST:587';

  if (Suggestions.find().count() === 0 ) {
    for (let i=0; i<occupations.length; i++) {
      Suggestions.insert({suggestion: occupations[i]});
    }
  }
});
