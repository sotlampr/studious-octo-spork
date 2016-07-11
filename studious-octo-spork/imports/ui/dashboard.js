import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Messages } from '../api/messaging/messaging.js';
import { Logbook } from '../api/transactions/logbook.js';
import { toggleRead } from '../api/messaging/methods.js';
import { deleteMessage } from '../api/messaging/methods.js';
import { updateUserProfile } from '../api/users/methods.js';
import './dashboard.html';
import { Suggestions } from '../api/suggestions/suggestions.js';
import { saveSuggestion } from '../api/suggestions/methods.js';
import { Events } from '../api/events/events.js';
import { Bert } from 'meteor/themeteorchef:bert';
import { addRequest } from '../api/events/methods.js';
import { removeRequest } from '../api/events/methods.js';
import { validateRequest } from '../api/events/methods.js';
import { editEvent } from '../api/events/methods.js';
import './common-helpers.js';


/*  Display informations for each event, on the calendar
*   args:
*     evnt:
*       the event item on the calendar
*     element:
*       where the item is being rendered (the data square)
*/
export const infoEvent = function (evnt, element) {
  element.find('.fc-content').html(
      '<h4 class="eventTitle">' + evnt.title + '</h4>' +
      '<p><span class="maroon bold">' +
      Meteor.users.findOne(evnt.giverId).username + '</span></p>' +
      '<p><span class="purple bold">' +
      Meteor.users.findOne(evnt.receiverId).username + '</span></p>'
      );
};


Template.dashboard.onCreated(function dashboardOnCreated() {
  this.subscribe('messages.user');
  this.subscribe('logbook.user');
  this.subscribe('users');
  this.subscribe('events');
  this.subscribe('suggestions');
});


Template.dashboard.helpers({
  settings: function () {
    return {
      position: "top",
      limit: 2,
      rules: [
        {
          collection: Suggestions,
          field: "suggestion",
          template: Template.autocomplete
        }
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
      var userMessages = Messages.find(
          {receiverId: Meteor.user()._id, visible:true},
          {sort: {read: 1, dateCreated: -1}});
      return userMessages;
    }
  },

  userTransactions: function () {
    // Retrieve the last 5 user transactions
    if (Meteor.user()) {
      var userTransactions = Logbook.find(
          {$or: [{giverValidated: true}, {receiverValidated: true}]},
          {sort: {date: -1}, limit: 5}
      );
      return userTransactions;
    }
  },

  isApproved: (data) => {
    if (data.giverValidated && data.receiverValidated) {
      return true;
    } else {
      return false;
    }
  },

  requests: function () {
    return Events.find({
      $and: [
        {
          $or: [
            {giverId: Meteor.userId()},
            {receiverId: Meteor.userId()}
          ]
        },
        {
          $or: [
            {giverValidated: false},
            {receiverValidated: false}
          ]
        }
      ]
    });
  },

  isEqual: function (x, y) {
    return x === y;
  },
});


Template.dashboard.events({
  'click .transactions-redirect': () => {
     // This is to remove an Uncaught Error from the console
     // Error: must be attached
     Meteor.defer(() => { FlowRouter.go('/dashboard/transactions'); });
  },

  'submit .update-profile': function (event) {
    // Handle the updating logic, call updateUserProfile afterwards
    event.preventDefault();
    updateUserProfile.call({
      id: Meteor.userId(),
      username: event.target.username.value,
      occupation: event.target.occupation.value,
      description: event.target.description.value
    });
    saveSuggestion.call({suggestion: event.target.occupation.value});
    Bert.alert('Your profile has been updated', 'success', 'growl-top-right');
  },

  'click .toggle-read': function () {
    toggleRead.call(this._id);
  },

  'click .delete': function () {
    deleteMessage.call(this._id);
  },

  'click .acceptRequest': function () {
    validateRequest.call({userId: Meteor.userId(), eventId: this._id});
    Bert.alert('The request has been validated', 'success', 'growl-top-right');
  },

  'click .denyRequest': function () {
    removeRequest.call({eventId: this._id});
    Bert.alert('The request has been denied', 'success', 'growl-top-right');
  },
});


Template.dashboard.onRendered( function () {
  $('#calendar').fullCalendar({
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
              {'giverId': Meteor.userId()},
              {'receiverId': Meteor.userId()}
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

    dayClick: function (date) {
      var today = moment();
      if (!moment(today).isAfter(date)) {
        var dt = date.format();
        if (!/T/.test(dt)) {
          dt = moment(date).set('hours', 17).format("YYYY-MM-DD HH:mm");
        }

        Session.set('eventModal', {type: 'add', date: dt});
        $('#add-edit-event-modal').modal('show');
      }
    },

    eventClick: function (evnt) {
      var today = moment().format();
      if (!moment(today).isAfter(evnt.start)) {
        Session.set('eventModal', {type: 'edit', evnt: evnt._id});
        $('#add-edit-event-modal').modal('show');
      }
    }
  });

  Tracker.autorun( function () {
    Events.find({
      $or : [
        {'giverId': Meteor.userId()},
        {'receiverId': Meteor.userId()}
      ]
    }).fetch();

    $('#calendar').fullCalendar('refetchEvents');
  });
});


Template.addEditEventModal.helpers({
  modalType: function (type) {
    let eventModal = Session.get('eventModal');
    if (eventModal) {
      return eventModal.type === type;
    }
  },

  modalLabel: function () {
    let eventModal = Session.get('eventModal');
    if (eventModal) {
      return {
        button: eventModal.type === 'edit' ? 'Edit' : 'Add',
        label: eventModal.type === 'edit' ? 'Edit' : 'Add an'
      };
    }
  },

  evnt: function () {
    let eventModal = Session.get('eventModal');

    if (eventModal) {
      return eventModal.type === 'edit' ? Events.findOne(eventModal.evnt) : {
        start: eventModal.date,
        end: moment(eventModal.date).add(1, 'hour').format("YYYY-MM-DD HH:mm")
      };
    }
  },

  givers: function () {
    return Meteor.users.find({_id: {$ne: Meteor.userId()}});
  },

  idToUsername: function (id) {
    return Meteor.users.findOne({_id: id}).username;
  },

  changeFormat: function (date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  },
});


// Close the Modal
let closeModal = function () {
  $('#add-edit-event-modal').modal('hide');
  $('.modal-backdrop').fadeout();
};


Template.addEditEventModal.events({
  'submit form': function (event, template) {
    event.preventDefault();

    let gvr = template.find('[name="giver"]').value;
    let rcvr = template.find('[name="receiver"]').value;
    let eventModal = Session.get('eventModal');
    let submitType = eventModal.type === 'edit' ? 'editEvent' : 'addEvent';
    let eventItem = {
      title: template.find('[name="title"]').value,
      giver: Meteor.users.findOne({username: gvr})._id,
      receiver: Meteor.users.findOne({username: rcvr})._id,
      start: moment(template.find('[name="start"]').value).toDate(),
      end: moment(template.find('[name="end"]').value).toDate()
    };

    if (submitType === 'editEvent') {
      eventItem.id = eventModal.evnt;
      eventItem.changer = Meteor.userId();
      editEvent.call(eventItem, (err, res) => {
        if (err) {
          Bert.alert(err.reason, 'warning', 'growl-top-right');
        } else {
          Bert.alert(
            'Your request has been added',
            'success',
            'growl-top-right'
          );
          closeModal();
        }
      });
    } else {
      addRequest.call(eventItem, (err, res) => {
        if (err) {
          Bert.alert(err.reason, 'warning', 'growl-top-right');
        } else {
          Bert.alert(
            'Your request has been added',
            'success',
            'growl-top-right'
          );
          template.find('[name="title"]').value = '';
          closeModal();
        }
      });
    }
  }
});


Template.addEditEventModal.onRendered( function () {
  $('.startpicker').datetimepicker({
    format: 'YYYY-MM-DD HH:mm'
  });

  $('.endpicker').datetimepicker({
    format: 'YYYY-MM-DD HH:mm'
  });
});
