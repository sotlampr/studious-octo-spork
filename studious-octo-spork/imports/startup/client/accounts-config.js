import { Accounts } from 'meteor/accounts-base';

Accounts.ui.config({
  passwordSignupFields: "USERNAME_AND_EMAIL"
});

Accounts.onLogin( function () {
  var path = FlowRouter.current().path;
  // Redirecting after successful login
  if (path === "/register") {
    FlowRouter.go("/");
  }
});
