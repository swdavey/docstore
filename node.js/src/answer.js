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


app.get('/nycfood/cuisines', async function(req, res) {
        try {
                let docArray = [];
                let session = await client.getSession();
                let col = await session.getSchema('nycfood').getCollection('outlets');
                let result = await col.find().fields('cuisine').groupBy('cuisine').sort('cuisine').execute(function(doc) {
                        docArray.push(doc);
                });
                result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
                session.close();
        } catch(err) {
                console.log(err);
                res.send({"error": "Internal Error"});
        }
});


app.get('/nycfood/outlets', async function(req, res) {
        try {
                let docArray = [];
                let session = await client.getSession();
                let col = await session.getSchema('nycfood').getCollection('outlets');
                let result = await col.find().fields('_id','borough','cuisine','name').sort('borough','cuisine','name').execute(function(doc) {
                        docArray.push(doc);
                });
                result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
                return session.close();
        } catch(err) {
                console.log(err);
                res.send({"error": "Internal Error"});
        }
});


app.get('/nycfood/outlet/:id', async function(req, res) {
        try {
                let docArray = [];
                let session = await client.getSession();
                let col = await session.getSchema('nycfood').getCollection('outlets');
                let result = await col.find('_id = :p1').bind('p1',req.params.id).execute(function(doc) {
                        docArray.push(doc);
                });
                result.getWarningsCount() > 0 ? res.send({"error": result.getWarnings()}) : res.send(docArray);
                return session.close();
        } catch(err) {
                console.log(err);
                res.send({"error": "Internal Error"});
        }
});


app.post('/nycfood/create', async function(req, res) {
        try {
                let outlet = {
                        "name": req.body.name,
                        "grades": [],           // Empty array for now
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
                let result = await col.add(outlet).execute();
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
                let result = await col.modify('_id = :p1').arrayInsert('grades[0]',grading).bind('p1',req.body.id).execute();
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


app.delete('/nycfood/remove', async function(req,res) {
        try {
                let session = await client.getSession();
                let col = await session.getSchema('nycfood').getCollection('outlets');
                let result = await col.remove('_id = :p1').bind('p1',req.body.id).execute();
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
