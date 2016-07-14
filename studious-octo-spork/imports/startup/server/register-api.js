/* register-api.js
 * Here we should import every API's methods.js and publications.js
 * in order for the server to see the required code
 */
import '../../api/email/methods.js';

import '../../api/messaging/methods.js';
import '../../api/messaging/server/publications.js';

import '../../api/users/methods.js';
import '../../api/users/server/publications.js';

import '../../api/events/methods.js';
import '../../api/events/server/publications.js';

import '../../api/suggestions/methods.js';
import '../../api/suggestions/server/publications.js';

import '../../api/transactions/methods.js';
import '../../api/transactions/server/publications.js';
