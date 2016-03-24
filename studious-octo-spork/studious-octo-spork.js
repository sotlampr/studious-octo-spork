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

  Template.dashboard.helpers({
    'user': function () {
      return {
        id: Meteor.userId(),
        email: Meteor.user().emails[0].address,
        username: Meteor.user().username
      };
    }
  });

  Template.usersById.helpers({
    'targetId': function() {
      return FlowRouter.getParam('id');
    },

    'user': function () {
      var targetUsername = FlowRouter.getParam('id');
      var targetUser = Meteor.users.findOne({username: targetUsername});
      if (targetUser) {
        return {
          email: targetUser.emails[0].address,
          username: targetUser.username
        };
      }
    }
  });

  Template.usersContactById.helpers({
    'targetId': function () {
      return FlowRouter.getParam('id');
    },
    'user': function () {
      var targetUsername = FlowRouter.getParam('id');
      var targetUser = Meteor.users.findOne({username: targetUsername});
      if (targetUser) {
        return {
          email: targetUser.emails[0].address,
          username: targetUser.username
        };
      }
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
