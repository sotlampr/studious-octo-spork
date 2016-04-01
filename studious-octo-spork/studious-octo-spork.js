Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {

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

  Template.usersIndex.events({
    'submit .findOccupation': function (event) {
      event.preventDefault();
      var work = event.target.work.value;
      event.target.work.value = '';
      Session.set('work', work);
    },

    'submit .findDescription': function (event) {
      event.preventDefault();
      var description = event.target.description.value;
      event.target.description.value = '';
      Session.set('description', description);
    },
  });

  Template.usersIndex.helpers({
    users: function () {
      return Meteor.users.find();
    },

    path: function (username) {
      return FlowRouter.path('/users/:username', {username: username});
    },

    //  ---EXAMPLE---
    // There is a dog with
    // username: jack
    // occupation: hunter
    // description: birds cats rabbits
    //
    // Searching with occupation:
    //  -success: hunter, hun, HuNTe
    // Searching with description:
    //  -success: birds cats rabbits, CAt, Ts Rab
    //  -fail: rabbits cats
    usersSearchWithOccupation: function () {
      var work = Session.get('work');
      var workSearch = new RegExp(work, 'i');
      if (work) {
        return Meteor.users.find({'profile.occupation': workSearch});
      }
    },

    usersSearchWithDescription: function () {
      var description = Session.get('description');
      var descriptionSearch = new RegExp(description, 'i');
      if (description) {
        return Meteor.users.find({'profile.description': descriptionSearch });
      }
    },
  });

  Template.dashboard.helpers({
    settings: function () {
      return {
        position: "top",
        limit: 5,
        rules: [
          {
            collection: Meteor.users,
            field: "profile.occupation",
            template: Template.autocomplete
          },
        ]
      };
    },
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
        var userMessages = Messages.find(
            {to: reciever, visible:true},
            {sort: {read: -1, dateCreated: -1}});
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
    },
    'click .toggle-read': function() {
      Messages.update({_id: this._id}, {$set: {read: !this.read}});
    },
    'click .delete': function () {
      Messages.update({_id: this._id}, {$set: {visible: false}});
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
  });

  Template.usersContactByUsername.events({
    'submit .send-message': function (event) {
      // Dump a new message on the Messages Collection
      event.preventDefault();
      Meteor.call('saveMessage', {
        to: FlowRouter.getParam('username'),
        from: Meteor.user().username,
        message: event.target.message.value,
        dateCreated: new Date(),
        read: false,
        visible: true
      });
      event.target.message.value = '';
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
  },

  saveMessage: function (data) {
    if (Meteor.user().username !== data.from) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Meteor.users.findOne({username: data.to})) {
      throw new Meteor.Error('user-not-exist');
    }
    Messages.insert(data);
  }
});
