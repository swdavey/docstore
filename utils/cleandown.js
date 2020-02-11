var mysqlx = require('mysqlx');

// Edit the next line by replacing <password> with your password
var session = mysqlx.getSession('root:<password>@localhost');

// If any of these commands hang make sure that no connections are being held by other processes. For example, if the node.js or java applications are running, their session pools will maintain open sessions.
session.dropSchema('ancestors');
session.dropSchema('joinDB');
session.dropSchema('nycfood');
