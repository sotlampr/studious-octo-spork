import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Email } from 'meteor/email';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidationError } from 'meteor/mdg:validation-error';


/*  After submit contact form, sendTestEmail
*   take the inputs (name, email, comment) and
*   call Email.send method
*/
export const sendTestEmail = new ValidatedMethod({
  name: 'email.sendTestEmail',

  validate: new SimpleSchema({
    name: { type: String },
    email: {
        type: String,
        regEx: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    comment: { type: String }
  }).validator(),

  run (data) {
    var bodyText = "Someone '" + data.name + "' with email: " +
      data.email + " sent you the comment: " + data.comment + " !";

    /*  form: web site email (website@gmail.com)
    *   to: admin email (admin@something.com)
    */
    Email.send({
      from: "",
      to: "",
      subject: "Subject test",
      text: bodyText
    });
  },
});
