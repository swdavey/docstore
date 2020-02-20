# Java DocStore Tutorial
## Introduction
First and foremostly this is not meant to be a masterclass in Java. This tutorial's purpose is to show how MySQL's CRUD interface to Document Store can be used in Java. However, in an attempt to provide some realism I have set the tutorial in the context of a REST application, and made use of industry standard frameworks. 

## Development Environment
* Eclipse - version 2019-12 (4.14.0). You can use whatever IDE you like or none at all; vi is great!
* Java - 1.8 SE
* Maven - 4.0.0. Again, this was my choice, you may prefer Gradle or some other build tool.

Note: annotations are used within the code. These will only work if Eclipse has annotations enabled. This may also be true of other IDEs.

## Frameworks and Libraries Used
* Spring
  * In order to provide: REST interface (GET, POST, PUT, PATCH, DELETE, etc) with HTTP server endpoint, and classes to handle responses and errors, etc.   
* Lombok
  * In order to avoid writing a lot of boiler plate code for the POJO classes. With the exception of one class, ODate.java, all POJOs have their constructors, getter, setter and toString methods implemented by Lombok.
  * Lombok needs to be included in the Pom **and** downloaded/installed in Eclipse. 
* Gson
  * Google’s JSON to Java, Java to JSON mapper. Other mappers could have been used (e.g. Jackson’s) but I found this to be the simplest method of converting between JSON and Java objects.
* com.mysql.cj.xdevapi
  * The connector that must be imported in order to connect to and query the MySQL Document Store.
  * Available from Maven.central. Whilst Maven downloaded this library, it failed to pick up the dependency on Google Protocol Buffers
  
Refer to the Maven Pom file for full details and versioning.

## Structure of Code ##
For simplicity all the code is held within a single package: com.swd.nycfood.outlets 
The code follows the Spring MVC pattern, and consists of:
* A launcher class: OutletsApplication.java
* A controller class: OutletsController.java
* A series of POJOs:
  * Input POJOs: Outlet.java, Grade.java (which has ODate.java)
  * Output POJOs: PersistedOutlet.java, AbbrvOutlet.java, Cuisine.java, Borough.java
  * Both Outlet.java and PersistedOutlet.java contain Address.java and an ArrayList of type Grade.java. 

The essential difference between the two classes is that PersistedOutlet has an additional \_id member as well as the method, void insertGrade(Grade newGrade). This is because Outlet.java is an input which is used in the creation of an Outlet document in the database. The database is responsible for providing a unique identifier, \_id. Therefore once an Outlet document has been persisted in the database it has an \_id field.   
  
  Clearly, I could have used inheritance such that PersistedOutlet extends Outlet 
  
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
