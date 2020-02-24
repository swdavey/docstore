# Java DocStore Tutorial
## Introduction
First and foremostly this is not meant to be a masterclass in Java. This tutorial's purpose is to show how MySQL's CRUD interface to Document Store can be used with Java. However, in an attempt to provide some realism we have set the tutorial in the context of a REST application, and made use of industry standard frameworks. 

### How the Application Works
The application is a restaurants listings application for New York City which is based on the data set provided here https://www.w3resource.com/mongodb-exercises/. The data is used unchanged and potentially you could either build on the code provided in this repository to answer the exercises on the w3resource webpage or simply use MySQL shell's Javascript or Python interface and answer interactively. Either way you should be able to see that MySQL Document Store may serve as an alternative to MongoDB. 

The application is started via a launcher class after which a controller waits for requests. When a request is received the underlying Spring framework routes the request to the required method in the controller and this method responds accordingly. If the request cannot be routed, then the underlying Spring framework will respond to the caller by sending a JSON document that will contain a timestamp, the error, a message providing detail about the error, an HTTP status code, and the URI path. If a request is routed and the method cannot find the resource or throws an exception then it will similarly send an error response.

## Development Environment
The following describes the environment 
* Eclipse - version 2019-12 (4.14.0). You can use whatever IDE you like or none at all; vi is great!
* Java - 1.8 SE
* Maven - 4.0.0. You may prefer Gradle or some other build tool.

Note: annotations are used within the code. These will only work if Eclipse has annotations enabled. This constraint may also be true of other IDEs.

## Frameworks and Libraries Used
* Spring
  * Used to establish an HTTP server, a REST interface with routing as well as classes and annotations to handle responses and errors, etc.   
* Lombok
  * In order to avoid writing a lot of boiler plate code for the POJO classes. With the exception of one class, ODate.java, all POJOs have their constructors, getter, setter and toString methods implemented by Lombok (i.e. by using the @Data annotation). The reason ODate is different is because Lombok does not handle the getting and setting of the ODate member $date because it starts with a **$**. If $date is changed to mydate then it will work. However, given we did not want to change the data set (which uses $date) we had to write these methods. To be clear, this is not an issue with Document Store, nor is it an issue with the data set, nor is it an issue with Java (because it's legal Java syntax); it is a problem with Lombok and would seem to be the same as this issue https://github.com/rzwitserloot/lombok/issues/2115
  * Lombok needs to be included in the Pom **and** downloaded/installed in Eclipse. 
* Gson
  * Google’s JSON to Java, Java to JSON mapper. Other mappers could have been used (e.g. Jackson’s) but we found this to be the simplest method of converting between JSON and Java objects. See also [DbDoc, Parsers and String](#dbdoc,-parsers-and-strings)
* com.mysql.cj.xdevapi
  * The connector that must be imported in order to connect to and query the MySQL Document Store.
  * Available from Maven.central. Whilst Maven downloaded this library, it failed to pick up the dependency on Google Protocol Buffers and these had to be referenced separately.
  
Refer to the Maven Pom file for full details and versioning.

## Overview of Code ##
For simplicity all the code is held within a single package: com.swd.nycfood.outlets.

The code follows the Spring MVC pattern, and consists of:
* A launcher class: OutletsApplication.java
* A controller class: OutletsController.java
* A series of POJOs:
  * Input POJOs: Outlet.java, Grade.java (which has ODate.java)
  * Output POJOs: PersistedOutlet.java, AbbrvOutlet.java, Cuisine.java, Borough.java
  * Both Outlet.java and PersistedOutlet.java contain Address.java and an ArrayList of type Grade.java. 

Outlet.java and PersistedOutlet.java are very similar classes the only differences being that the latter has an additional **\_id** member as well as the method, **void insertGrade(Grade newGrade)**. This is because Outlet.java is an input POJO and is only used for the creation of an Outlet document in the database, whereas PersistedOutlet is used for all subsequent operations. When an Outlet is inserted into the database (as a JSON document), the database provides it with a unique identifier: this identifier is both added to the JSON document and used as a primary key by the database. Given the identifier is now part of the persisted document in the database, when we retrieve the document from the database and map it into a Java object we need to make provision for this new field, hence, the additional **\_id** member in PersistedOutlet.java class. Some further points:

* Instead of allowing the database to provide a unique identifier for the Outlet document, we could have provided one from our application code. However, our code would have to guarantee its uniqueness. This is not too difficult to do with a single connection, but may get more complex when hundreds of users are attempting to concurrrently add documents. As such, it was decided to leave this task to the database (because we know it does it correctly and efficiently).
* Inheritance could have been used such that PersistedOutlet extends Outlet. However, inheritance seems to work against the intentions of Lombok: if it were used we would have ended up writing a constructor for PersistedOutlet. 

Returning to the other difference, the **void insertGrade(Grade newGrade)** method. The reason this is present in PersistedOutlet.java and not Outlet.java is due to a simple design decision: when an Outlet document is first created there will be no grading; grading is an operation subsequent to creation and therefore only operate on PersistedOutlet objects.

The input POJOs, Outlet.java, Grade.java and classes they include all use the Lombok annotation @NonNull on their members (where there members are not set at time of construction). This ensures that all keys have values otherwise Spring will return an error response. However, we have not gone as far as proper type and bounds checking: the point of this exercise is to demonstrate Document Store rather than write a perfect Java application. 

As mentioned previously all POJOs with the exception of ODate use the Lombok @Data annotation which implements their constructor, getter, setter and toString methods. ODate cannot use @Data due to a Lombok [issue/bug](#frameworks-and-libraries-used).

The output POJOs are nothing more than convenience classes such that Spring can deal with representative Java objects rather than generic DbDoc objects representations of JSON objects. For more details see [DbDoc, Parsers and String](#dbdoc,-parsers-and-strings) below.

## Overview of com.mysql.cj.xdevapi Classes Used
The Java API can be found at https://dev.mysql.com/doc/dev/connector-j/8.0/?com/mysql/cj/xdevapi/package-summary.html

### Schema and Collection
rtytryt

### Result and DocResult
etretret

### DbDoc, Parsers and Strings
In Document Store we can store JSON objects using either a String representation of the JSON object, or as DbDoc representation (see [AddStatement](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/AddStatement.html)).

When we retrieve documents from the database, they are returned as DbDoc objects (as part of a DocResult object). These can then be returned to the client via the Spring framework as is, or as a Java String, or as representative Java object. It is instructive to see each of these:

**Returning a DbDoc representation of a PersistedOutlet JSON document.** Firstly the code:
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<Object> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    return new ResponseEntity<>(doc,HttpStatus.OK);
}
```
Secondly what the client receives:

**Returning a String representation of a PersistedOutlet JSON document.** Firstly the code:
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<Object> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    return new ResponseEntity<>(doc.toString(),HttpStatus.OK);
}
```
Secondly what the client receives:

**Using reflection to return a PersistedOutlet.** Firstly the code:
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<Object> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    PersistedOutlet po = new Gson().fromJson(doc.toString(),PersistedOutlet.class));
    return new ResponseEntity<>(po,HttpStatus.OK);
}
```
Secondly what the client receives:

JsonParser versus Gson

### Error Handling
etretret

## Test Data
The test data comes from MongoDB's 
