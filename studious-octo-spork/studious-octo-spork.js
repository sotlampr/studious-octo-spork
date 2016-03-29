Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.App_body.events({
    'click .signout': function () {
      // logout
      Meteor.logout();
      FlowRouter.go('/');
    }
  });

  Template.contact.events({
    'submit .testemail': function (event) {
      event.preventDefault();
      Meteor.call('sendTestEmail',{
        name: event.target.name.value,
        email: event.target.email.value,
        comment: event.target.comments.value
      });
      event.target.name.value = '';
      event.target.email.value = '';
      event.target.comments.value = '';
    }
  });

  Template.usersIndex.helpers({
    users: function () {
      return Meteor.users.find();
    },
    path: function (username) {
      return FlowRouter.path('/users/:username', {username: username});
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
    },
    userMessages: function () {
      // See if we have any messages for this user
      if (Meteor.user()) {
        var reciever = Meteor.user().username;
        var userMessages = Messages.find({to: reciever});
        return userMessages;
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

  Template.usersByUsername.helpers({
    targetUsername: function() {
      return FlowRouter.getParam('username');
    },

    userData: function () {
      var targetUsername = FlowRouter.getParam('username');
      var targetUser = Meteor.users.findOne({username: targetUsername});
      if (targetUser) {
        return {
          username: targetUser.username,
          occupation: targetUser.profile.occupation,
          description: targetUser.profile.description
        };
      }
    }
  });

  Template.usersContactByUsername.helpers({
    targetUsername: function() {
      return FlowRouter.getParam('username');
    },

    userData: function () {
      var targetUsername = FlowRouter.getParam('username');
      var targetUser = Meteor.users.findOne({username: targetUsername});
      if (targetUser) {
        var userData = {
            email: targetUser.emails[0].address,
            username: targetUser.username
        };
        return userData;
      }
    }
  });

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

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // USERNAME: Complete email address (website@gmail.com)
    // PASSWORD: Email password (gmail password)
    // HOST: Smtp server address (for gmail is stmp.gmail.com, for hotmail is stmp.live.com, ...)
    process.env.MAIL_URL = 'smtp://USERNAME:PASSWORD@HOST:587';
  });

  Accounts.onCreateUser(function (options, user) {
    user.profile = user.profile || {};
    user.profile.occupation = '';
    user.profile.description = '';
    return user;
  });

  Meteor.methods({
    sendTestEmail: function (data) {
      var bodytext = "Someone '" + data.name + "' with email: " + data.email + " sent you the comment: " + data.comment + " !";
      Email.send({
        from: "", // form web site email (website@gmail.com)
        to: "",   // to admin email (admin@something.com)
        subject: "Subject test",
        text: bodytext
      });
    }
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
