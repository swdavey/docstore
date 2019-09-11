# docstore
MySQL Document Store allows developers to work with SQL relational tables and schema-less JSON collections. To make that possible MySQL has created the X Dev API which puts a strong focus on CRUD by providing a fluent API allowing you to work with JSON documents in a natural way. The X Protocol is highly extensible and is optimized for CRUD as well as SQL API operations.

The purpose of this repository is to make available the contents and collateral of the presentation I gave to the Groningen NL PHP Meetup on 05/09/2019 and Swanseacon Conference Wales on 09/09/2019 such that a broader audience can make use of it. The recommended approach is: read the presentation; then work through the demo; then work through the tutorial, and then read the presentation again.  

The collateral includes:
1. **DocumentStore.pdf** - the slide deck of the presentation
2. **demo.html** - details how to perform the demo given in Groningen and Swansea. This will allow you to get up to speed with both MySQL shell and the XDevAPI. It covers simple to advanced usage; the more advanced items include indexing collections and the joining of collections to collections and tables. Note that this file has a dependency on the **nosql.png** file.
3. **tutorial.html** - the demo introduces you to the XDevAPI whereas the tutorial allows you to get hands on practice of using its CRUD interface in a programming context. It is written in node.js but you should not need to be fluent in this language to be able to complete the tutorial.
4. **nycfood.zip** - test data required for both the demonstration and the tutorial
5. **createJoinDB.js** - a supporting script to load a schema that will allow the joining of collections to collections and collections to tables to be demonstrated without having to type for a day.
6. **index.js** - this is the source code that you will modify in order to complete the tutorial.
7. **create.json** and **update.json** - input json files that support the tutorial
8. **answer.js** - avoid this until you have done the tutorial or have become stuck!

**To run the demonstration you will need to:**
1. Download and install MySQL 8.0.17 or later. Linux users: if you install from the tar-ball then you will also need to install MySQL Shell. When installing from repos (using yum or apt) then MySQL shell should be installed. Similarly windows users will install MySQL Shell as part of the server install. A good resource for installing the tar-ball binaries on Linux is https://dev.mysql.com/doc/mysql-secure-deployment-guide/8.0/en/ . The working assumption for the rest of this readme is that you will be working on a local database server (i.e. localhost)
2. Once the database server and mysql shell binaries are installed you will need to load the contents of nycfood.zip. For this, your machine will need zip/unzip binaries. Assuming you are using linux the process is as follows:
```
  unix$ pwd                   // So you know which directory you are unzipping the file
  /home/stuart                // you will need to know this path when you perform the util.importJson (see below)  
  unix$ unzip nycfood.zip
  unix$ mysqlsh
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> var col = session.createSchema('nycfood').createCollection('outlets')
  mysqlsh localhost:33060+ ssl js> util.importJson('/home/stuart/nycfood.json', {'schema': 'nycfood', 'collection': 'outlets'})
  mysqlsh localhost:33060+ ssl js> \q
  unix$
```
3. Load the file demo.html into your browser and follow its instructions.

**To run the tutorial you will need to:**
1. Download and install Node v10; the original tutorial use 10.16.3
2. Once the node binaries are installed, you will need to create a project. The following details an approach on Linux
```
  unix$ pwd
  /home/stuart                // or whatever directory you are starting from
  unix$ mkdir -p dev/tutorial
  unix$ cd dev/tutorial
  unix$ npm init              // The simplest thing is to press return to all prompts without adding any detail
  unix$ npm install express --save          // load the modules the tutorial requires
  unix$ npm install body-parser --save
  unix$ npm install @mysql/xdevapi --save
```
3. Copy the index.js file (and potentially the answer.js file) into the project's directory, and then create a test directory and copy in the create.json and update json files. The directory structure should look something like
```
  unix$ pwd
  unix$ /home/stuart/dev/tutorial
  unix$ ls -l
  total 40
  -rw-rw-r--.  1 stuart stuart  5794 Sep 10 13:56 answer.js
  -rw-rw-r--.  1 stuart stuart  6031 Sep  3 15:58 index.js
  drwxrwxr-x. 55 stuart stuart  4096 Aug 24 16:49 node_modules
  -rw-rw-r--.  1 stuart stuart   315 Aug 24 16:49 package.json
  -rw-rw-r--.  1 stuart stuart 15151 Aug 24 11:13 package-lock.json
  drwxrwxr-x.  2 stuart stuart    44 Sep  3 16:12 test
  unix$ ls -l test
  total 8
  -rw-rw-r--. 1 stuart stuart 236 Aug 24 21:55 create.json
  -rw-rw-r--. 1 stuart stuart 108 Sep  3 16:12 update.json
  unix$
```
  
3. Set the username and password in the session connection pool. If you don't want to use the root user then you can create a user as follows (use a different name and password if you like):
```
  unix$ mysql
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> \sql
  mysqlsh localhost:33060+ ssl SQL> CREATE USER 'tutorial'@'%' IDENTIFIED BY 'MyPa55w0rd';
  mysqlsh localhost:33060+ ssl SQL> GRANT SELECT, INSERT, UPDATE, DELETE ON nycfood.* TO 'tutorial'@'%';
  mysqlsh localhost:33060+ ssl js> \q
  unix$
```  
Then, using your favourite header change the code that sets up the client session connection pool in index.js by entering your values for <username> and <password>.

FROM
```
const client = mysqlx.getClient(
        {user: '<username>', host: 'localhost', password: '<password>', port: 33060},
        {pooling: { enabled: true, maxIdleTime: 30000, maxSize: 25, queueTimeout: 10000}}
);
```
TO
```
const client = mysqlx.getClient(
        {user: 'tutorial', host: 'localhost', password: 'MyPa55w0rd', port: 33060},
        {pooling: { enabled: true, maxIdleTime: 30000, maxSize: 25, queueTimeout: 10000}}
);
```
Note: you should make a similar change to answer.js but you may not wish to look at this code without trying the tutorial first!

If you have worked through the demonstration then you may wish to clean down the outlets collection before doing the tutorial. The following details how to do this:
```
  unix$ pwd
  /home/stuart                // Change directory to wherever you have saved nycfood.json
  unix$ mysqlsh
  mysqlsh js> \c root@localhost
  mysqlsh localhost:33060+ ssl js> var db = session.getSchema('nycfood')
  mysqlsh localhost:33060+ ssl js> db.dropCollection('outlets')
  mysqlsh localhost:33060+ ssl js> util.importJson('/home/stuart/nycfood.json', {'schema': 'nycfood', 'collection': 'outlets'})
  mysqlsh localhost:33060+ ssl js> \q
  unix$
```  
4. Your machine will need cURL binaries.

You should now be good to go. For details load the file tutorial.html into your browser and follow its instructions.
