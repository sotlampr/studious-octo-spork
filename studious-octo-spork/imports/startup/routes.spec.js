import { FlowRouter } from 'meteor/kadira:flow-router';

// SINGLE ROUTES
FlowRouter.route('/local', {
  name: 'local',
  action: () => console.log("Testing...")
});
