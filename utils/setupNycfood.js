var mysqlx = require('mysqlx');

// Edit the next line by replacing <password> with your password.
var AUTH_STR = 'root:<password>@localhost';

// Edit the next line by replacing <path> with your path to nycfood.json  
var IFILE = '<path>/nycfood.json';
var DOCSTORE = {
	'schema': 'nycfood',
	'collection' : 'outlets'
};

var session = mysqlx.getSession(AUTH_STR);
try {
	var schema = session.getSchema(DOCSTORE.schema);
	session.dropSchema(DOCSTORE.schema);
} catch(err) {
	// do nothing
}
session.createSchema(DOCSTORE.schema);
util.importJson(IFILE,DOCSTORE);
