if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.usersIndex.helpers({
    'users': function () {
      return Meteor.users.find();
    }
  });

  Template.usersById.helpers({
    'targetId': function () {
      return FlowRouter.getParam('id');
    }
  });

  Template.usersContactById.helpers({
    'targetId': function () {
      return FlowRouter.getParam('id');
    }
  });

  Accounts.onLogin( function () {
    var path = FlowRouter.current().path;
    // Redirecting after successful login
    if (path === "/register") {
      FlowRouter.go("/");
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
