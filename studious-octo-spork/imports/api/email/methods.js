import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Email } from 'meteor/email';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidationError } from 'meteor/mdg:validation-error';


/*  Send a email (name, email, comment)
 *  args:
 *    name:
 *      String, the person's name
 *    email:
 *      String, the person's email
 *    comment:
 *      String, the comment
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
     *  to: admin email (admin@something.com)
     */
    Email.send({
      from: "",
      to: "",
      subject: "Subject test",
      text: bodyText
    });
  },
});
