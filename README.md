# docstore
MySQL Document Store allows developers to work with SQL relational tables and schema-less JSON collections. To make that possible MySQL has created the X Dev API which puts a strong focus on CRUD by providing a fluent API allowing you to work with JSON documents in a natural way. The X Protocol is highly extensible and is optimized for CRUD as well as SQL API operations.

The purpose of this repository is to make available the contents and collateral of the presentation I gave to the Groningen NL PHP Meetup on 05/09/2019 and Swanseacon Conference Wales on 09/09/2019 such that a broader audience can make use of it. The recommended approach is: read the presentation; then work through the demo; then work through the tutorial (either or both the node.js and java tutorials), and then read the presentation again.  

The structure of the collateral is as follows:
1. **DocumentStore.pdf** - the slide deck of the presentation
2. **demo** folder - details of how to perform the demonstration using mysql shell
3. **node.js tutorial** folder - source code and details of how to perform the tutorial
4. **java tutorial** folder - maven pom file, source code and details of how to perform the tutorial
5. **utilities** folder - scripts to setup/cleandown the database
6. **testdata** folder - JSON documents to support the demo and tutorials

**To run the demonstration and tutorials you will need to:**
1. Download and install MySQL 8.0.17 or later. Linux users: if you install from the tar-ball then you will also need to install MySQL Shell. When installing from repos (using yum or apt) then MySQL shell should be installed. Similarly windows users will install MySQL Shell as part of the server install. A good resource for installing the tar-ball binaries on Linux is https://dev.mysql.com/doc/mysql-secure-deployment-guide/8.0/en/ . The working assumption for the rest of this readme is that you will be working on a local database server (i.e. localhost)
2. Go to either the demo folder or either of the tutorial folders and follpw the instructions in the readme. 
