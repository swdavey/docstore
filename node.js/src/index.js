const express = require('express');
const bodyParser = require('body-parser');
const mysqlx = require('@mysql/xdevapi');

const app = express();
const port = 3000;
const client = mysqlx.getClient(
	{user: '<username>', host: 'localhost', password: '<password>', port: 33060},
	{pooling: { enabled: true, maxIdleTime: 30000, maxSize: 25, queueTimeout: 10000}}
);

app.use(bodyParser.json());
app.listen(port, function() {
	console.log(`Example app listening on port ${port}!`);
});


app.get('/nycfood/boroughs', async function(req, res) {
	try {
		let docArray = [];
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');
		let result = await col.find().fields('borough').groupBy('borough').sort('borough').execute(function(doc) {
			docArray.push(doc);
		});
		result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
		session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});

/* Exercise 1

app.get('/nycfood/cuisines', async function(req, res) {
	// Enter your answer here
});


/* Exercise 2

app.get('/nycfood/outlets', async function(req, res) {
	try {
		let docArray = [];
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');

		// Task: using the Xdevapi CRUD interface populate the docArray with a list of
		// outlets sorted on borough, cuisine and name. Each outlet should have the
		// fields _id, borough, cuisine and name

		let result = await <enter your answer here>


		result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
		return session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});


/* Exercise 3

app.get('/nycfood/outlet/:id', async function(req, res) {
	try {
		let docArray = [];
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');

		// Task: using the Xdevapi CRUD interface populate the docArray with the single
		// outlet identified by the last element of the URI. Use a bind variable.
		// If you don't wish to use the docArray, limit the number of docs you can receive
		// to one (you should only ever receive one) and assign to a variable.

		let result = await <enter your answer here>


		result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
		return session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});


/* Exercise 4

app.post('/nycfood/create', async function(req, res) {
	try {
		let outlet = {
			"name": req.body.name,
			"grades": [],	   // Empty array for now
			"address": {
				"coord": [
					req.body.latitude,
					req.body.longitude
				],
				"street": req.body.street,
				"zipcode": req.body.zipcode,
				"building": req.body.building
			},
			"borough": req.body.borough,
			"cuisine": req.body.cuisine,
			"restaurant_id": req.body.restaurant_id
		};
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');

		// Task: using the Xdevapi CRUD interface write code to add a new outlet

		let result = await <enter your answer here>

		let summary = null;
		if (result.getWarningsCount() > 0) {
			summary = {"error": result.getWarnings()};
		} else {
			summary = {
				'rows': result.getAffectedRowsCount(),
				'items': result.getAffectedItemsCount(),
				"ids": result.getGeneratedIds()
			};
		}
		res.send(summary);
		session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});


/* Exercise 5

app.delete('/nycfood/remove', async function(req,res) {
	try {
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');

		// Task: using the Xdevapi CRUD interface write code to remove an outlet.
		// Use a bind variable.

		let result = await <enter your answer here>

		let summary = null;
		if (result.getWarningsCount() > 0) {
			summary = {"error": result.getWarnings()};
		} else {
			summary = {'rows': result.getAffectedRowsCount(), 'items': result.getAffectedItemsCount()};
		}
		res.send(summary);
		session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});


/* Exercise 6

app.patch('/nycfood/grade', async function(req, res) {
	try {
		let grading = {
			'time': {
				'$time': new Date().getTime()   // time in millisecs since the epoch
			},
			'grade' : req.body.grade,
			'score' : req.body.score
		};
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');

		// Task: using the Xdevapi CRUD interface write code to modify an outlet by adding a grading.
		// Use a bind variable for the _id only.

		let result = await <enter your answer here>

		let summary = null;
		if (result.getWarningsCount() > 0) {
			summary = {"error": result.getWarnings()};
		} else {
			summary = {'rows': result.getAffectedRowsCount(), 'items': result.getAffectedItemsCount()};
		}
		res.send(summary);
		session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});


/* Exercise 7

app.put('/nycfood/update', async function(req,res) {
	try {
		let session = await client.getSession();
		let col = await session.getSchema('nycfood').getCollection('outlets');
		let doc = await col.getOne(req.body.id);
		for(let key of Object.keys(req.body)) {
			if (key != "id") {
				doc[key] = req.body[key];
			}
		}
		let result = await col.replaceOne(req.body.id,doc);
		let summary = null;
		if (result.getWarningsCount() > 0) {
			summary = {"error": result.getWarnings()};
		} else {
			summary = {'rows': result.getAffectedRowsCount(), 'items': result.getAffectedItemsCount()};
		}
		res.send(summary);
		session.close();
	} catch(err) {
		console.log(err);
		res.send({"error": "Internal Error"});
	}
});

*/
