# docstore
MySQL Document Store allows developers to work with SQL relational tables and schema-less JSON collections. To make that possible MySQL has created the X Dev API which puts a strong focus on CRUD by providing a fluent API allowing you to work with JSON documents in a natural way. The X Protocol is highly extensible and is optimized for CRUD as well as SQL API operations.

The purpose of this repository is to make available the contents and collateral of the presentation I gave to the Groningen NL PHP Meetup on 05/09/2019 such that a broader audience can make use of it.

The collateral includes:
1. PDF version of the presentation
2. Demonstration walk through so you can practice using Document Store, the XDevAPI and MySQL shell
3. nycfood.zip - required for both the demonstration and the tutorial
4. createJoinDB.js - a script to load a schema that will allow the joining of collections to collections and collections to tables to be demonstrated.
5. Tutorial Instructions (HTML) - the tutorial is a hands-on practical that will allow you to use the CRUD interface in a programming context. It is written in node.js but you should not need to be fluent in this language to be able to complete the tutorial.
6. Tutorial Code Template, index.js - use this if you want to do the tutorial.
7. Tutorial Test Data - a selection of cURL commands to exercise the code as well as the json input files, create.json and update.json
8. Tutorial Code Answer, answer.js - avoid this until you have done the tutorial!

To run the demonstration you will need to:
1. Download and install MySQL 8.0.17 or later. Linux users: if you install from the tar-ball then you will also need to install MySQL Shell. When installing from repos (using yum or apt) then MySQL shell should be installed. Similarly windows users will install MySQL Shell as part of the server install. A good resource for installing the tar-ball binaries on Linux is https://dev.mysql.com/doc/mysql-secure-deployment-guide/8.0/en/ . The working assumption for the rest of this readme is that you will be working on a local database server (i.e. localhost)
2. Once the database server and mysql shell binaries are installed you will need to load the contents of nycfood.zip. Assuming you are using linux the process is as follows 
  unix$ pwd                   // So you know which directory you are unzipping the file
  /home/stuart                // you will need to know this path when you perform the util.importJson (see below)  
  unix$ unzip nycfood.zip
  unix$ mysqlsh
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> var col = session.createSchema('nycfood').createCollection('outlets')
  mysqlsh localhost:33060+ ssl js> util.importJson('/home/stuart/nycfood.json', {'schema': 'nycfood', 'collection': 'outlets'})
  mysqlsh localhost:33060+ ssl js> \q
  unix$

To run the tutorial you will need to:
1. Download and install Node v10; the original tutorial use 10.16.3
2. Set the username and password in the session connection pool. If you don't want to use the root user then you can create a user as follows (use a different name and password if you like):
  unix$ mysql
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> \sql
  mysqlsh localhost:33060+ ssl SQL> CREATE USER 'tutorial'@'%' IDENTIFIED BY 'MyPa55w0rd';
  mysqlsh localhost:33060+ ssl SQL> GRANT SELECT, INSERT, UPDATE, DELETE ON nycfood.* TO 'tutorial'@'%';
  mysqlsh localhost:33060+ ssl js> \q
  unix$
  
Then, using your favourite header change the code that sets up the clien session connection pool in index.js
FROM

const client = mysqlx.getClient(
        {user: '<username>', host: 'localhost', password: '<password>', port: 33060},
        {pooling: { enabled: true, maxIdleTime: 30000, maxSize: 25, queueTimeout: 10000}}
);

TO
const client = mysqlx.getClient(
        {user: 'tutorial', host: 'localhost', password: 'MyPa55w0rd', port: 33060},
        {pooling: { enabled: true, maxIdleTime: 30000, maxSize: 25, queueTimeout: 10000}}
);

Note: you should make a similar change to answer.js but you may not wish to look at this code without trying the tutorial first!

If you have worked through the demonstration then you may wish to clean down the outlets collection before doing the tutorial. The following details how to do this:

  unix$ pwd
  /home/stuart                // Change directory to wherever you have saved nycfood.json
  unix$ mysqlsh
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> var db = session.getSchema('nycfood')
  mysqlsh localhost:33060+ ssl js> db.dropCollection('outlets')
  mysqlsh localhost:33060+ ssl js> util.importJson('/home/stuart/nycfood.json', {'schema': 'nycfood', 'collection': 'outlets'})
  mysqlsh localhost:33060+ ssl js> \q
  unix$
  
You should now be good to go. For details load the file tutorial.html into your browser and follow its instructions.
