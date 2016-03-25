if (Meteor.isClient) {
  // When we remove this?
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
    formData: function () {
      // Data for pre-filling the dashboard form
      user = Meteor.users.findOne(Meteor.userId());
      if (user) {
        return {
          id: user._id,
          username: user.username,
          occupation: user.profile.occupation,
          description: user.profile.description
        };
      }
    }
  });

  Template.dashboard.events({
    'submit .update-profile': function (event) {
      // Handle the updating logic, call updateUserProfile afterwards
      event.preventDefault();
      Meteor.call('updateUserProfile', {
        id: Meteor.userId(),
        username: event.target.username.value,
        occupation: event.target.occupation.value,
        description: event.target.description.value
      });
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

  Accounts.onCreateUser(function (options, user) {
    user.profile = user.profile || {};
    user.username = '';
    user.profile.occupation = '';
    user.profile.description = '';
    return user;
  });
}

Meteor.methods({
  updateUserProfile: function (data) {
    // Handle updating of user profile
    if (Meteor.userId() !== data.id) {
      throw new Meteor.Error('not-authorized');
    }
    Meteor.users.update(data.id, {$set: {
      username: data.username,
      'profile.occupation': data.occupation,
      'profile.description': data.description
    }}, {validate: false});
  }
});
