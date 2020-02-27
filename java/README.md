# Java DocStore Tutorial
## Introduction
First and foremostly this is not meant to be a masterclass in Java. This tutorial's purpose is to show how MySQL's CRUD interface for Document Store can be used with Java. However, in an attempt to provide some realism we have set the tutorial in the context of a REST application, and made use of industry standard frameworks. 

The application is a REST-based restaurants listings application for New York City. The data set for this application has been taken from https://www.w3resource.com/mongodb-exercises/ and is made up of JSON Documents which take the form:
```
{
    "address": {                               // embedded JSON object
        "building": "1007",           
        "coord": [ -73.856077, 40.848447 ],    // simple numeric array
        "street": "Morris Park Ave",
        "zipcode": "10462"
    }
    "borough": "Bronx",
    "cuisine": "Bakery",
    "grades": [{                               // Grade array: each Document will have zero, one or more grade objects
        "date": { 
            "$date": 1393804800000             // Possibly *awkward* key
        }, 
        "grade": "A", 
        "score": 2 
    }, 
    { 
        "date": { 
            "$date": 1378857600000 
        }, 
        "grade": "A", 
        "score": 6 
    }],
    "name": "Morris Park Bake Shop",
    "restaurant_id": "30075445"
}
```
This provides a realistic Document to work with: it is not facile inasmuch that it has nested JSON objects, JSON arrays and a potentially difficult key to deal with in $date; it is not overly complex or large to prevent understanding. Note that when such documents are added to a MySQL Document Store collection an additional field **\_id** will be added which will ensure the uniqueness of the document; MongoDB has a similar device. 

Should you wish to do so, you could either build on the code provided in this repository to answer the exercises on the w3resource webpage or simply use MySQL shell's Javascript or Python interface and answer interactively. Either way you should be able to see that MySQL Document Store can serve as a viable alternative to MongoDB. 

### How the Application Works

The application is started via a launcher class after which a controller waits for requests. When a request is received the underlying Spring framework routes the request to the required method in the controller and this method responds accordingly. If the request cannot be routed or the code throws an exception, then the underlying Spring framework will respond to the caller by sending a JSON document that will contain a timestamp, the error, a message providing detail about the error, an HTTP status code, and the URI path. If a request is routed and the method cannot find the resource or throws an exception then it will similarly send an error response.

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

The code follows the Spring MVC pattern, and consists of the following classes:
* A launcher class: OutletsApplication.java
* A controller class: OutletsController.java
* A series of model classes implemented as POJOs:
  * Inputs: Outlet.java, Grade.java (which contains ODate.java)
  * Outputs: PersistedOutlet.java, AbbrvOutlet.java, Cuisine.java, Borough.java
    * Grade.java has an ODate.java class
    * Both Outlet.java and PersistedOutlet.java contain Address.java and an ArrayList of type Grade.java.
* Views: there is no code associated with views. All the application does is return Java objects (output POJOs or Strings) as responses to the underlying Spring Framework, which does whatever it does prior to returning them to the client. 

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
In Document Store we typically persist JSON objects using the [AddStatement](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/AddStatement.html)). The JSON object(s) to be persisted must either be a String representation of each JSON object, or (XDevAPI) [DbDoc]((https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/DbDoc.html)) object representations, or Map representations. 

A String representation must be a properly quoted and escaped JSON string otherwise the call may either fail or you may end up persisting a single String rather than the complex JSON object you were expecting. For example the JSON object below
```JSON
{
  "firstname": "Fred",
  "lastname": "Flintstone",
  "age": 40
}
```
would need to be written as the follows in order to be correctly stored in the database.
```
String s = "{\"firstname\":\"Fred\",\"lastname\":\"Flintstone\",\"age\":40}";
myCollection.add("s").execute();
```
This is cumbersome and becomes very complicated once nested objects and arrays become involved. However, help is at hand:
* Spring REST methods use POJOs as parameters.
* Mapping and parsing classes are available. These can map a POJO to a JSON object, and then parse it to a DbDoc object.
   * The mapper we have used is Google's [Gson](https://javadoc.io/doc/com.google.code.gson/gson/latest/com.google.gson/com/google/gson/Gson.html).
   * The parser we have used is the XDevAPI's JsonParser. Some points to note:
     * The Gson mapper will produce a String depicting a JSON object, but it will not produced an escaped JSON String. As mentioned earlier, the AddStatement requires a properly escaped Json String in order to correctly persist a JSON document. The code snippet below details both what Gson produces and what the AddStatement requires.
     * The AddStatement can use a DbDoc object in lieu of a String. The JsonParser class has static methods that allow the creation of DbDoc objects from JSON Strings.
     * For whatever reason, the JsonParser class has been omitted from the XDevAPI's API Documentation. However, the source code can be found on [Github](https://github.com/mysql/mysql-connector-j/blob/release/8.0/src/main/user-impl/java/com/mysql/cj/xdevapi/JsonParser.java). Reading through the source code it is apparent that the JsonParser has a static method, **dbDoc parseDoc(String jsonString)**, that will take an unescaped JsonString and parse it to produce a DbDoc.

The following code snippet details how we can use Gson and JsonParser to properly persist a POJO:
```java
// Assume we have a POJO called person with three fields: 
//     String firstname = "Fred"; String lastname = "Flintstone"' int age = 40;

String jsonString = new Gson().toJson(person);    // Create a Json String using Gson 
System.out.println(jsonString);                   // Prints: {"firstname": "Fred", "lastname": "Flintstone", "age": 40}
                                                  // to use the addStatement with a String, the String needs to be escaped:
                                                  //    "{\"firstname\":\"Fred\",\"lastname\":\"Flintstone\",\"age\":40}"
DbDoc doc = JsonParser.parseDoc(jsonString);      // ...but we can create a DbDoc from the String provided by Gson 
myCollection.add(doc).execute();                  // and then add it to the database

// Of course we could condense this code to a single line:
// myCollection.add(JsonParser.parseDoc(new Gson().toJson(person));
```
Which is a whole lot easier and more maintainable than writing Strings.

A further way of creating a DbDoc is to use the DbDocImpl builder and add JsonValue objects (e.g. JsonString, JsonNumber, JsonLiteral, JsonArray). The [DbDoc](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/DbDoc.html) API documentation details how to use this method. Again, this looks cumbersome when compared to using Gson and JsonParser.

When we retrieve documents from the database, they are returned as DbDoc objects (as part of a DocResult object). These can then be returned to the client via the Spring framework as is, or as a Java String, or as a reflected Java object. It is instructive to see each of these:

**Returning a DbDoc representation of a persisted JSON document.** 

Firstly the code:
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<DbDoc> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    return new ResponseEntity<>(doc,HttpStatus.OK);
}
```
Secondly what the client receives:
```json
{
    "_id": {
        "string": "00005e224d500000000000000ee8"
    },
    "address": {
        "building": {
            "string": "10"
        },
        "coord": [
            {
                "integer": -74,
                "bigDecimal": -74.16543
            },
            {
                "integer": 50,
                "bigDecimal": 50.676765
            }
        ],
        "street": {
            "string": "Top Street"
        },
        "zipcode": {
            "string": "WA16 6HT"
        }
    },
    "borough": {
        "string": "Knutsford"
    },
    "cuisine": {
        "string": "English"
    },
    "grades": [
        {
            "date": {
                "$date": {
                    "integer": 1667609309,
                    "bigDecimal": 1582215574237
                }
            },
            "grade": {
                "string": "A"
            },
            "score": {
                "integer": 10,
                "bigDecimal": 10
            }
        },
        {
            "date": {
                "$date": {
                    "integer": 1666473320,
                    "bigDecimal": 1582214438248
                }
            },
            "grade": {
                "string": "B"
            },
            "score": {
                "integer": 8,
                "bigDecimal": 8
            }
        }
    ],
    "name": {
        "string": "The Eldon"
    },
    "restaurant_id": {
        "string": "123456"
    }
}

```
The first point to note is that the result comes back as JSON. However, the values to the keys may not be quite what we were expecting given they describe JsonValues rather than Strings or Numbers, etc. A further point to note is that numeric types are described both as integers and bigDecimals. In all cases the bigDecimal stores the correct value (i.e. the value that was entered). The integer is an 8 byte integer, and will represent the 8 least significant bytes of the bigDecimal if the value is greater than 8 bytes. If the bigDecimal value is a float type then the corresponding integer will only report the whole part. Some examples will help illustrate this:
* Refer to the first date value in the JSON above, the bigDecimal value is 1582215574237 and the integer is 1667609309: <br>
1582215574237<sub>Dec</sub> = 1706365B2DD<sub>Hex</sub><br>
the last eight bytes 6365B2DD<sub>Hex</sub> = 1667609309<sub>Dec</sub> which is the integer value shown.
* Refer to the first value of the set of coordinates in the JSON above. the bigDecimal value is -74.16543 and the integer value is -74. Given the whole part of the value does not exceed that which can be contained in 8 bytes, the mantissa is stripped from bigDecimal and the whole part is assigned to the integer (which is -74).

Therefore, it is probably true to say that a raw DbDoc is of limited value to an end client such as a browser. However, the immediate application code can make good use of it.

**Returning a String representation of a persisted JSON document.** 

Firstly the code:
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<String> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    return new ResponseEntity<>(doc.toString(),HttpStatus.OK);
}
```
Secondly what the client receives:
```
{"_id":"00005e224d500000000000000ee8","address":{"building":"10","coord":[-74.16543,50.676765],"street":"Top Street","zipcode":"WA16 6HT"},"borough":"Knutsford","cuisine":"English","grades":[{"date":{"$date":1582215574237},"grade":"A","score":10},{"date":{"$date":1582214438248},"grade":"A","score":10}],"name":"The Eldon","restaurant_id":"123456"}
```
This is far more useful to most clients. The JSON is properly formed (albeit not pretty-printed). Note also that the numeric values are the bigDecimals rather than integers.

Care needs to be taken when returning Strings because it is very easy to return a String that encapsulates a stringified JSON object. When this happens you will see lots of escape characters and as a consequence your client code may not be able to properly handle it. We discuss this later in the [Controller Walkthrough](#controller-walkthrough).

**Using reflection to return a Java object representation of a persisted JSON document.** 

Firstly the code, note the use of Gson's fromJson() method to create a PersistedOutlet object (which is a POJO):
```java
@GetMapping("/nycfood/outet/{id}"
ResponseEntity<PersistedOutlet> getOutlet(@PathVariable String id) {
    ...
    DocResult dr = col.find("_id = :param).bind("param",id).execute();
    DbDoc doc = dr.fetchOne();
    PersistedOutlet po = new Gson().fromJson(doc.toString(),PersistedOutlet.class));
    return new ResponseEntity<>(po,HttpStatus.OK);
}
```
Secondly what the client receives:
```
{
    "_id": "00005e224d500000000000000ee8",
    "name": "The Eldon",
    "grades": [
        {
            "score": 10,
            "grade": "A",
            "date": {
                "$date": 1582215574237
            }
        },
        {
            "score": 10,
            "grade": "A",
            "date": {
                "$date": 1582214438248
            }
        }
    ],
    "address": {
        "street": "Top Street",
        "zipcode": "WA16 6HT",
        "building": "10",
        "coord": [
            -74.16543,
            50.676765
        ]
    },
    "borough": "Knutsford",
    "cuisine": "English",
    "restaurant_id": "123456"
}
```
The Spring framework converts the returned Java object to a pretty-printable string and sends it onwards to the client. In the case of a client capable of pretty printing (e.g. Postman), then it will be printed as shown above, otherwise it will be printed as per the previous string example.

In summary, when retrieving documents from the database they will always be of type DbDoc. A DbDoc is a map which describes the document in terms of JsonValue objects and (potentially) other nested DbDoc objects (which will also be formed of JsonValue objects). Typically you will not return the DbDoc object directly to the end client, but will return either a String representation of it (using the DbDoc objects toString() method) or reflect it into a truly representative Java object. By creating a reflected Java object you open the door to performing more complex processing on it, e.g. incorporating it into other Java objects, querying and updating it via its getter and setter methods, etc. Of course you can always return such an object to the end client letting Spring do the necessary conversions to form it into a coherent JSON string.

### Error Handling
etretret

## Test Data
The test data comes from MongoDB's 

## Controller Walkthrough

Blah - detail why we are not talking about POJOs, detail what we are providing in terms of the API

### OutletsController Class and Constructor
```java
package com.swd.nycfood.outlets;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;
import com.google.gson.Gson;
import com.mysql.cj.xdevapi.*;

@RestController
class OutletsController {

    private static final String SCHEMA = "nycfood";
    private static final String COLLECTION = "outlets";
    private Gson mapper = new Gson();
    private Client cli = null;

    OutletsController() {
        String cnxUrl = "mysqlx://localhost:33060/nycfood?user=root&password=<Pa55word>";
        String pool =  "{\"pooling\":{\"enabled\":true, \"maxSize\":25,\"maxIdleTime\":30000, \"queueTimeout\":10000}}"; 
        cli = new ClientFactory().getClient(cnxUrl,pool);
    }
    @GetMapping("/nycfood/boroughs") ResponseEntity<String> getBoroughs() {...}
    @GetMapping("/nycfood/cuisines") ResponseEntity<List<String>> getCuisines() {...}
    @GetMapping("/nycfood/outlets") ResponseEntity<String> getAllOutlets() {...}
    @GetMapping("/nycfood/outlet/{id}") ResponseEntity<String> getOutlet(@PathVariable String id) {...}
    @DeleteMapping("/nycfood/outlet/{id}") ResponseEntity<Result> deleteOutlet(@PathVariable String id) {...}
    @PatchMapping("/nycfood/outlet/{id}") ResponseEntity<Result> gradeOutlet(@RequestBody Grade newGrade, @PathVariable String id) {...}
    @PutMapping("/nycfood/outlet/{id}") ResponseEntity<Result> replaceOutlet(@RequestBody Outlet replacement, @PathVariable String id) {...}
    @PostMapping("nycfood/outlet") ResponseEntity<Result> createOutlet(@RequestBody Outlet newOutlet) {...}
}
```
The OutletsController class uses the Spring framework to route incoming requests to its methods. It achieves this using annotations: 
* @RestController to identify where REST requests should be sent
* Mapping verbs (@GetMapping, etc.) to its methods to handle the received requests
* @PathVariable and @RequestBody to indicate parameters passed as part of a REST request. 
We use further classes from the Spring framework's http and web packages to allow the methods to respond to requests in a Spring-like manner. 

The methods in the controller class all need to access the database in order to create, read, update and delete JSON documents. Hence we import the XdevAPI connector classes. We also import Gson because we use this class as a convenient way to map between Java and JSON objects.

At time of construction we create an instance of Gson called mapper. According to Google's documentation this is a thread-safe class. Therefore, in order to avoid the overhead of repeated construction and garbage collection in the methods, we have create a single instance and made it available to all methods of Outletscontroller (note: Spring controllers are singletons: there will be just one instance of OutletsController per application instantiation).

The other task of the constructor is to create a Session Connection Pool. The code for the Connection Pool has been lifted directly from the [XDevAPI User Guide](https://dev.mysql.com/doc/x-devapi-userguide/en/connecting-connection-pool.html). It should go without saying that in production code you would not hard-code the connection URL, and would load usernames and passwords from secure locations. You would probably also read in values for the pool from a configuration file. The values configure the pool in the following manner:
* enabled: **true** meaning use the pool; if **false** is entered then pooling will not be used, you will just create and use connections as required.
* maxSize: the maximum number of connections the pool can grow to.
* maxIdleTime: The maximum number of milliseconds a connection is allowed to idle in the queue before being closed. A zero value means infinite.
* queueTimeout: The maximum number of milliseconds a request is allowed to wait for a connection to become available. A zero value means infinite.

### getBoroughs()
This method provides a list of the boroughs of New York that have food outlets registered in the application. The list only contains one entry for each borough, and the boroughs are listed alphabetically.
```java
    @GetMapping("/nycfood/boroughs")
    ResponseEntity<String> getBoroughs() { 
        Session sess = cli.getSession();
        Collection col = sess.getSchema(SCHEMA).getCollection(COLLECTION);
        DocResult dr = col.find().fields("borough AS borough").groupBy("borough").sort("borough").execute();
        String boroughs = dr.fetchAll().toString();
        sess.close();
        return new ResponseEntity<>(boroughs,HttpStatus.OK);
    } 
```
The first line of the method simply gets a session connection from the pool, **cli**, that was created at the time of the OutletController's construction.

The second line gets a Collection object, **col**, that is effectively our handle on the database. Note that we chain the getSchema() and getCollection() methods.

The third line creates a [FindStatement](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/FindStatement.html) and executes it:
* **.find()** - we are querying all the documents in the collection
* **.fields("borough AS borough")** - we are only interested in the value for the key, "borough" in each document
* **.groupBy("borough")** - we only want unique values (i.e. no duplicates of a borough name in the output)
* **.sort("borough")** - we want to sort alphabetically in ascending order
  *  to sort descending we would have written sort("borough desc")

As can be seen The above methods effectively build a query for the database to execute, and we execute it by appending **.execute()** to the chain. The order in which methods are chained is both critical and logical. The [XDevAPI User Guide]https://dev.mysql.com/doc/x-devapi-userguide/en/crud-ebnf-collection-crud-functions.html details method chaining and ordering.

Perhaps the most interesting of the chained methods is the fields() method and its use of the String Projection, "borough AS borough". This projection instructs the database to only retrieve the "borough" value and then store this value in the resulting dbDoc using the key, "borough". If we wanted to complicate things we could have used a different projection, for example col.find().fields("borough AS region")..., and in this case instead of "borough" being a key in the DbDoc we would see, "region".

The dr.fetchAll() call returns a List<T> where type T will be DbDoc. In this case individual DbDoc objects will look like this:
```Java
 {
     "borough": {               // the key
         "string": "Bronx"      // the JsonValue which is of type JsonString
     }
 }
 ```
When the toString() method of a List<T> is called the returned String will be created by calling the toString() methods of each instance of type T in the list. Given T is a DbDoc, then for each dbDoc in the List its toString() method will be printed for each dbDoc in the list its key and the toString() value of its JsonValue. For the example above this would result in {"borough": "Bronx"}.
 
The final two lines in the method, close the session (which allows the pool to reset and reuse the connection) and return the list of boroughs. Note that we don't simply return a list of boroughs but use Spring's ResponseEntity in order to provide additional information for the client in the form of an HTTP status code. For details of its use please refer to this [article](https://www.baeldung.com/spring-response-entity).

The (pretty-printed) output from getBoroughs() will look like this:
```JSON
[
    {
        "borough": "Bronx"
    },{
        "borough": "Brooklyn"
    },{
        "borough": "Manhattan"
    },{
        "borough": "Queens"
    },{
        "borough": "Staten Island"
    }
]
```
Given we are only returning boroughs it may be more helpful just to return the values in an array (e.g. \["Bronx","Brooklyn",...,"Staten Island"\] ) rather than as individual JSON objects. getCusines() tackles this problem.

### getCuisines()
This method provides a list of cuisines available from the food outlets registered in the application. The list only contains one entry for each cuisine. Note that the output is a JSON array, and that array only contains values. It does not contain any keys. This may be considered an improvement over the code in getBoroughs() because it's really quite boring reading the same key name for each value.
```java
    @GetMapping("/nycfood/cuisines")
    ResponseEntity<List<String>> getCuisines() {
        List<String> cuisineList = new ArrayList<>(); 
        Session sess = cli.getSession();
        Collection col = sess.getSchema(SCHEMA).getCollection(COLLECTION);
        DocResult dr = col.find().fields("cuisine AS cuisine").groupBy("cuisine").sort("cuisine").execute();
        dr.forEach(dbDoc -> cuisineList.add(mapper.fromJson(dbDoc.get("cuisine").toString(),String.class)));
        sess.close();
        return new ResponseEntity<>(cuisineList,HttpStatus.OK);
    } 
```
The code in getCuisines() is very similar to that of getBoroughs() indeed the only differences of substance is the creation of a List to store the outputs from the database (as opposed to using a simple String), and the processing of the DocResult, dr.forEach(...).

The dr.forEach() allows us to iterate through the list of DbDoc objects in the DocResult. You will note that the body of the loop uses reflection to create a String which is then added to the List. This does not seem entirely intuitive. This seems the natural thing to do:
```java
    dr.forEach(dbDoc -> cuisineList.add(dbDoc.get("cuisine"));
```
However, that will return a JsonValue, e.g. { "String" : "Afghan" }, rather than the required String. We could of course append a toString() method:
```java
    dr.forEach(dbDoc -> cuisineList.add(dbDoc.get("cuisine").toString());
```
...but that will result in an escaped jsonString being added to the array, e.g. "\[\"Afghan\",...]". To overcome this, we convert the jsonString to a String using the mapper's fromJson() method (remember mapper is the instance of Gson we created at the time of the OutletsController's construction). This provides us with the array we require:
```
["Afghan","African","American","Armenian",...,"Turkish","Vegetarian","Vietnamese/Cambodian/Malaysian"]
```
### getAllOutlets()
This method provides an abbreviated list of all of the outlets in the collection. An *abbreviated* outlet only details the outlet's ID, name, the borough in which it is located in and the type of cuisine it serves. The list is sorted alphabetically in borough, cuisine and name order.
```java
    @GetMapping("/nycfood/outlets")
    ResponseEntity<String> getAllOutlets() { 
        Session sess = cli.getSession();
        Collection col = sess.getSchema(SCHEMA).getCollection(COLLECTION);
        DocResult dr = col.find().fields("_id AS id","name AS name","cuisine AS cuisine","borough AS borough").sort("borough","cuisine","name").execute();
        String outlets = dr.fetchAll().toString();
        sess.close();
        return new ResponseEntity<>(outlets,HttpStatus.OK);
    }
```
Again, the code is almost identical to getBoroughs() the only real difference being the sequence of projections used and the sorting across keys.

One of the issues with bringing back entire collections to an application server is memory usage. A fetchAll() method may eat too much memory and so a batching strategy may be required where you retrieve a number of documents from the DocResult and then send them onto the client, before retrieving the next batch and so on. This will require iterating through the list of DbDoc objects in the DocResult which can be achieved with either the DocResult's iterator method (forEach() - see [getSession](###getSession()), or perhaps more conveniently using hasNext() and next() syntax, for example:
```java
        ...
        while(dr.hasNext()) {
            DbDoc doc = dr.next();
            // do something with doc
        }
        ...
 ```
 
To make this method more useful to end users we could include the location coordinates for each outlet. These are provided by the key, coord, located in an embedded JSON object called, address, within the outlet document. To access them we would need to provide the path to coord in the fields() String projection using dot notation to delimit the path components:
```java
        ...
        DocResult dr = col.find().fields("_id AS id","address.coord as coords", "name AS name","cuisine AS cuisine","borough AS borough").sort("borough","cuisine","name").execute();
        ...
```
Another change we could make is to limit a search to a borough (which would also obviate the need to print out the borough entry). To do this we would put a search condition in the find() method. For example:
```java
        ...
        DocResult dr = col.find('borough = "Brooklyn"').fields("_id AS id","address.coord AS coords", "name AS name","cuisine AS cuisine").sort("borough","cuisine","name").execute();
        ...
```
In the above example we have used literals, but typically you would use bind variables. These are discussed in the next method.

### getOutlet(@PathVariable String id)
This method simply returns all the information on a particular outlet identified by the path variable, id. This id is compared to each document's \_id.
```java
    @GetMapping("/nycfood/outlet/{id}")
    ResponseEntity<String> getOutlet(@PathVariable String id) { 
        Session sess = cli.getSession();
        Collection col = sess.getSchema(SCHEMA).getCollection(COLLECTION);
        DocResult dr = col.find("_id = :param").bind("param",id).execute();
        if (dr.count() != 1) {
            sess.close();
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No matching document for id on path.");
        } 
        String outlet = dr.fetchOne().toString();
        sess.close();
        return new ResponseEntity<>(outlet,HttpStatus.OK);
    }
```
Again, the code for this method is very similar to the previously described methods. The only differences are: the use of search criteria in the find() method; the use of a bind variable to improve the efficiency of the call; some simple error checking, and the use of fetchOne(). 

A bind variable is a placeholder in a statement that will be replaced with a value. The purpose of a bind variable is to improve database performance. The first time a statement is executed the database will create an execution plan taking into account that a variables will need to be inserted for each *bind* when the statement is executed. Subsequent executions re-use this plan saving the overhead of re-creating it. 

The find() method has a search expression within it that checks for equality between the collection's Document IDs and a bound id variable called **:param** (we could have called it anything, but it must be preceded by a colon (**:**) ). The value to be inserted into the bind variable is given by the bind() method. Because we can have multiple bind variables we need to be able to map them correctly, and as a consequence the bind() method's first parameter will use the same name as that in the find() method less its leading colon (**:**); the second parameter will be the variable to be inserted. It is well worth reading the XdevAPI Guide's section on [Parameter Binding] from start to finish in order to understand its subtleties and language specifics.

Given we are searching on \_id and we know that these must be unique, we can expect either 0 or 1 DbDoc objects to be returned to the DocResult (i.e. we will either find it in the collection of Documents or not). As such we test for the number of DbDoc objects and if the count is not one, we close the session and throw an exception. If we get past the if statement then we know we have precisely one DbDoc available and that this will represent the Document we were searching for. Consequently, we use the DocResult objects fetchOne() method to retrieve the DbDoc and then call the DbDoc objects toString() method as we have done in the previous sections.

### deleteOutlet(@PathVariable String id)
If the passed id matches a Document's \_id then that Document will be deleted. If no match is made a message to that effect is returned. 
```java
    @DeleteMapping("/nycfood/outlet/{id}")
    ResponseEntity<Result> deleteOutlet(@PathVariable String id) {
        Session sess = cli.getSession();
        Collection col = sess.getSchema(SCHEMA).getCollection(COLLECTION);
        Result result = col.remove("_id = :param").bind("param",id).execute();
        sess.close();
        if (result.getAffectedItemsCount() != 1) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No matching document for id on path.");
        }
        return new ResponseEntity<>(result,HttpStatus.OK);
    }
```


