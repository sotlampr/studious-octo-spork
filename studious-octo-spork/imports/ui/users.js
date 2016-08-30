import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import './users.html';
import { saveMessage } from '../api/messaging/methods.js';
import { Bert } from 'meteor/themeteorchef:bert';
import { Events } from '../api/events/events.js';
import { infoEvent } from './dashboard.js';
import { saveTransaction } from '../api/transactions/methods.js';
import { avatar } from './body.js';
import { userFromUserId } from './dashboard.js';


Template.usersIndex.onCreated(function usersIndexOnCreated() {
  this.subscribe('users');
});


Template.usersIndex.events({
  'submit .find': function (event) {
    event.preventDefault();

    var tar = event.target;
    var id = tar.getAttribute('id');
    Session.set('work', '');
    Session.set('description', '');

    if (id === 'occupation' ) {
      Session.set('work', tar.work.value);
    } else {
      Session.set('description', tar.description.value);
    }

    tar.reset();
  }
});


Template.usersIndex.helpers({
  users: function () {
    return Meteor.users.find();
  },

  path: function (username) {
    return FlowRouter.path('/users/:username', {username: username});
  },

  /*  ---EXAMPLE---
   *  There is a dog with
   *  username: jack
   *  occupation: hunter
   *  description: birds cats rabbits
   *
   *  Searching with occupation:
   *    -success: hunter, hun, HuNTe
   *  Searching with description:
   *    -success: birds cats rabbits, CAt, Ts Rab
   *    -fail: rabbits cats
   */
  usersSearch: function () {
    var work = Session.get('work');
    var workSearch = new RegExp(work, 'i');
    var description = Session.get('description');
    var descriptionSearch = new RegExp(description, 'i');
    if (work && work !== '') {
      return Meteor.users.find({'profile.occupation': workSearch});
    } else if (description && description !== '') {
      return Meteor.users.find({'profile.description': descriptionSearch });
    }
  },

  avatar: avatar,

  user: userFromUserId,

  occupations: function () {
    return _.uniq(Meteor.users.find({}).map( function(x) {return x.profile.occupation}));
  }
});


Template.usersByUsername.onCreated(function usersByUsernameOnCreated() {
  this.subscribe('users');
  this.subscribe('events');
});


Template.usersByUsername.helpers({
  userIsNotSelf: function () {
    return Meteor.users.findOne({ _id: Meteor.userId()}).username
           !== FlowRouter.getParam('username');
  },

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
        description: targetUser.profile.description,
        about: targetUser.characteristic,
        user: targetUser
      };
    }
  },

  avatar: avatar,
});


Template.usersByUsername.events({
  'submit #claim-session': function (event) {
    // Handle the updating logic, call updateUserProfile afterwards
    event.preventDefault();

    let data = {
      giverValidated: event.target.giverValidated.checked,
      receiverValidated: event.target.receiverValidated.checked,
      giverId: Meteor.userId(),
      receiverId: Meteor.users.findOne({ username: FlowRouter.getParam('username') })._id,
      description: event.target.sessionDescription.value,
      cost: Number(event.target.sessionCost.value),
    };

    saveTransaction.call(data, (err, res) => {
     if(err) {
        Bert.alert(err.reason, 'danger', 'growl-top-right' );
      } else {
        event.target.reset();
        Bert.alert(
          'The transaction has been recorded.', 'success',
          'growl-top-right'
        );
      }
    });
  }
});


Template.usersContactByUsername.onCreated(function usersContactByUsernameOnCreated() {
  this.subscribe('users');
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
    username = FlowRouter.getParam('username');
    saveMessage.call({
      receiverId: Meteor.users.findOne({username: username})._id,
      message: event.target.message.value,
    }, (err, res) => {
      if(err) {
        // HANDLE ERROR
        Bert.alert(err.reason, 'danger', 'growl-top-right' );
      } else {
        event.target.message.value = '';
        Bert.alert(
          'Your message has been received', 'success',
          'growl-top-right'
        );
      }
    });
  }
});


Template.usersByUsername.onRendered( function () {
  let usrId = Meteor.users.findOne({
    username: FlowRouter.getParam('username')})._id;

  $('#calendarUser').fullCalendar({
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },

    eventRender: infoEvent,

    events: function (start, end, timezone, callback, err) {
      let data = Events.find({
        $and: [
          {
            $and: [
            {giverValidated: true},
            {receiverValidated: true}
            ]
          },
          {
            $or : [
              {'giverId': usrId},
              {'receiverId': usrId}
            ]
          }
        ]
      }).fetch().map( function (evnt) { return evnt; });

      if (err) {
        return callback(err);
      }

      if (data) {
        callback(data);
      }
    },
  });

  Tracker.autorun( function () {
    Events.find({ $or : [{'giverId': usrId}, {'receiverId': usrId}] }).fetch();
    $('#calendarUser').fullCalendar('refetchEvents');
  });
});
