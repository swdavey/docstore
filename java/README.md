# Java DocStore Tutorial
## Development Environment
* Eclipse
* Java
* Maven

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
  
Refer to the Maven Pom file for full details.

## Structure of Code ##
For simplicity all the code is held within a single package: com.swd...
The code follows the Spring MVC pattern, and consists of:
* A launcher class
* A controller class
* A series of POJOs
  * Inputs: Outlet.java, Grade.javA
  * Outputs: PesistedOutlet, AbbrvOutlet, Cuisine.java, Borough.jav

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
