# Java DocStore Tutorial
## Introduction
First and foremostly this is not meant to be a masterclass in Java. This tutorial's purpose is to show how MySQL's CRUD interface to Document Store can be used with Java. However, in an attempt to provide some realism we have set the tutorial in the context of a REST application, and made use of industry standard frameworks. 

### How the Application Works
The application is a restaurants listings application for New York City which is based on the data set provided here https://www.w3resource.com/mongodb-exercises/. The data is used unchanged and potentially you could either build on the code provided in this repository to answer the exercises on the w3resource webpage or simply use MySQL shell's Javascript or Python interface and answer interactively. Either way you should be able to see that MySQL Document Store may serve as an alternative to MongoDB. 

The application is started via a launcher class after which a controller waits for requests. When a request is received the underlying Spring framework routes the request to the required method in the controller and this method responds accordingly. If the request cannot be routed, then the underlying Spring framework will respond to the caller by sending a JSON document that will contain a timestamp, the error, a message providing detail about the error, an HTTP status code, and the URI path. If a request is routed and the method cannot find the resource or throws an exception then it will similarly send an error response.

## Development Environment
* Eclipse - version 2019-12 (4.14.0). You can use whatever IDE you like or none at all; vi is great!
* Java - 1.8 SE
* Maven - 4.0.0. You may prefer Gradle or some other build tool.

Note: annotations are used within the code. These will only work if Eclipse has annotations enabled. This may also be true of other IDEs.

## Frameworks and Libraries Used
* Spring
  * In order to provide a REST interface (GET, POST, PUT, PATCH, DELETE, etc) as well as a HTTP server endpoint and classes to handle responses and errors, etc.   
* Lombok
  * In order to avoid writing a lot of boiler plate code for the POJO classes. With the exception of one class, ODate.java, all POJOs have their constructors, getter, setter and toString methods implemented by Lombok.
  * Lombok needs to be included in the Pom **and** downloaded/installed in Eclipse. 
* Gson
  * Google’s JSON to Java, Java to JSON mapper. Other mappers could have been used (e.g. Jackson’s) but we found this to be the simplest method of converting between JSON and Java objects.
* com.mysql.cj.xdevapi
  * The connector that must be imported in order to connect to and query the MySQL Document Store.
  * Available from Maven.central. Whilst Maven downloaded this library, it failed to pick up the dependency on Google Protocol Buffers and these had to be referenced separately.
  
Refer to the Maven Pom file for full details and versioning.

## Structure of Code ##
For simplicity all the code is held within a single package: com.swd.nycfood.outlets.

The code follows the Spring MVC pattern, and consists of:
* A launcher class: OutletsApplication.java
* A controller class: OutletsController.java
* A series of POJOs:
  * Input POJOs: Outlet.java, Grade.java (which has ODate.java)
  * Output POJOs: PersistedOutlet.java, AbbrvOutlet.java, Cuisine.java, Borough.java
  * Both Outlet.java and PersistedOutlet.java contain Address.java and an ArrayList of type Grade.java. 

Outlet.java and PersistedOutlet.java are very similar the only differences being that the latter has an additional **\_id** member as well as the method, **void insertGrade(Grade newGrade)**. This is because Outlet.java is an input POJO and should only be used for the creation of an Outlet document in the database whereas PersistedOutlet should be used for all subsequent operations. When an Outlet is inserted into the database (as a JSON document), the database provides it with a unique identifier: this identifier is both added to the JSON document and used as a primary key by the database. Given the identifier is now part of the persisted document in the database, when we retrieve the document from the database and map it into a Java object we need to make provision for this new field, hence, the additional **\_id** member in PersistedOutlet.java class. Some further points:

* Instead of allowing the database to provide a unique identifier for the Outlet document, we could have provided one from our application code. However, our code would have to guarantee its uniqueness. This is not too difficult to do with a single connection, but may get more complex when hundreds of users are attempting to concurrrently add documents. As such, it was decided to leave this task to the database (because we know it does it correctly and efficiently).
* Inheritance could have been used such that PersistedOutlet extends Outlet. However, inheritance seems to work against the intentions of Lombok: if it were used we would have ended up writing a constructor for PersistedOutlet. 

Returning to the other difference, the **void insertGrade(Grade newGrade)** method, the reason this is present in PersistedOutlet.java and not Outlet.java is due to a simple design decision: when an Outlet document is first created there will be no grading; grading is an operation subsequent to creation and therefore only operate on PersistedOutlet objects.


## Overview of com.mysql.cj.xdevapi Classes Used
The Java API can be found at https://dev.mysql.com/doc/dev/connector-j/8.0/?com/mysql/cj/xdevapi/package-summary.html

### Schema and Collection
rtytryt

### Result and DocResult
etretret

### DbDoc and String
tytryre

### Error Handling
etretret

## Test Data
The test data comes from MongoDB's 
