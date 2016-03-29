// Routes for studious-octo-spork app

// Helper function for boilerplate code
var renderTemplate = function (name) {
  return function () { BlazeLayout.render('App_body', {main: name}); };
};

// SINGLE ROUTES
FlowRouter.route('/', {
  name: 'Index',
  action: renderTemplate('hello')
});

FlowRouter.route('/about', {
  name: 'About',
  action: renderTemplate('about')
});

FlowRouter.route('/contact', {
  name: 'Contact',
  action: renderTemplate('contact')
});

FlowRouter.route('/register', {
  name: 'Register',
  action: renderTemplate('register')
});

FlowRouter.route('/dashboard', {
  name: 'Dashboard',
  action: renderTemplate('dashboard')
});

// GROUP ROUTES
var userRoutes = FlowRouter.group({
  prefix: '/users',
  name: 'users'
});

userRoutes.route('/', {
  name: 'Users.index',
  action: renderTemplate('usersIndex')
});

userRoutes.route('/:username', {
  name: 'Users.by_username',
  action: renderTemplate('usersByUsername')
});

userRoutes.route('/:username/contact', {
  name: 'Users.by_username.contact',
  action: renderTemplate('usersContactByUsername')
});

