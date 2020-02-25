# Java DocStore Tutorial
## Introduction
First and foremostly this is not meant to be a masterclass in Java. This tutorial's purpose is to show how MySQL's CRUD interface to Document Store can be used with Java. However, in an attempt to provide some realism we have set the tutorial in the context of a REST application, and made use of industry standard frameworks. 

The application is a restaurants listings application for New York City which is based on the data set provided here https://www.w3resource.com/mongodb-exercises/. The data is used unchanged. Potentially you could either build on the code provided in this repository to answer the exercises on the w3resource webpage or simply use MySQL shell's Javascript or Python interface and answer interactively. Either way you should be able to see that MySQL Document Store may serve as an alternative to MongoDB. 

### How the Application Works

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
In Document Store we can store JSON objects using either a String representation of each JSON object, or as a sequence of one or more (XDevAPI) DbDoc objects (see [AddStatement](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/AddStatement.html)). A String representation must be a properly quoted and escaped JSON string otherwise the call may fail or you may end up persisting a single String rather than a complex JSON object you were expecting. For example the JSON object below
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

A further way of creating a DbDoc is to use the DbDocImpl builder and add key-pair-values (which may be strings, numbers, objects, etc.). Again, this is laborious and cumbersome and probably limited to edge use-cases. The [DbDoc](https://dev.mysql.com/doc/dev/connector-j/8.0/com/mysql/cj/xdevapi/DbDoc.html) API documentation details how to use this method.

When we retrieve documents from the database, they are returned as DbDoc objects (as part of a DocResult object). These can then be returned to the client via the Spring framework as is, or as a Java String, or as a reflected Java object. It is instructive to see each of these:

**Returning a DbDoc representation of a persisted JSON document.** 

Firstly the code:
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
The first point to note is that the result comes back as JSON. However, the values to the keys are not quite what we were expecting given they describe both the value and type. A further point to note is that numeric types are described both as integers and bigDecimals. In all cases the bigDecimal stores the correct value (i.e. the value that was entered). The integer is an 8 byte integer, and will represent the 8 least significant bytes of the bigDecimal if the value is greater than 8 bytes. If the bigDecimal value is a float type then the corresponding integer will only report the whole part. Some examples will help illustrate this:
* Refer to the first date value in the JSON above, the bigDecimal value is 1582215574237 and the integer is 1667609309: <br>
1582215574237<sub>Dec</sub> = 1706365B2DD<sub>Hex</sub><br>
the last eight bytes 6365B2DD<sub>Hex</sub> = 1667609309<sub>Dec</sub> which is the integer value shown.
* Refer to the first value of the set of coordinates in the JSON above. the bigDecimal value is -74.16543 and the integer value is -74. Given the whole part of the value does not exceed that which can be contained in 8 bytes, the mantissa is stripped from bigDecimal and the whole part is assigned to the integer (which is -74).

Therefore, it is probably true to say that a DbDoc representation of an object is of limited value to a true client but may have value to Java application code.

**Returning a String representation of a persisted JSON document.** 

Firstly the code:
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
```string
{"_id":"00005e224d500000000000000ee8","address":{"building":"10","coord":[-74.16543,50.676765],"street":"Top Street","zipcode":"WA16 6HT"},"borough":"Knutsford","cuisine":"English","grades":[{"date":{"$date":1582215574237},"grade":"A","score":10},{"date":{"$date":1582214438248},"grade":"A","score":10}],"name":"The Eldon","restaurant_id":"123456"}
```
This is far more useful to most clients. The JSON is properly formed (albeit not pretty-printed). Note also that the numeric values are the bigDecimals rather than integers.

Care needs to be taken when returning Strings because it is very easy to return a String that encapsulates a stringified JSON object. When this happens you will see lots of escape characters and as a consequence your client code may not be able to properly handle it. We discuss this later in the [Controller Walkthrough](#controller-walkthrough).

**Using reflection to return a Java object representation of a persisted JSON document.** 

Firstly the code, note the use of Gson's fromJson() method to create a PersistedOutlet object:
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
```json
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
The client receives a JSON object. In the case of a Postman client or client capable of pretty printing, then it will format the object as shown, otherwise it will be printed as per the string example above.

In summary when retrieving documents from the database they will always be of type DbDoc. A DbDoc is a map which describes the document down to a level of the element types. It is envisaged that this will only be useful to the application in a few edge cases, and that typically you will use the DbDoc.toString() method to extract a string representation of a JSON object. You can then either return that a String object to the end client, or convert into into a Java object that reflects its true type. The advantage of creating a Java object is that it is very easy to update the object using getter and setter objects. Compare this to updating a DbDoc object where you have to specify document paths to keys, etc. If you are using Spring then you can simply return Java objects to the end client and Spring will do all the necessary conversions. If you not using Spring or a similar framework then you will probably be constrained to always returning a String representation. 

### Error Handling
etretret

## Test Data
The test data comes from MongoDB's 

## Controller Walkthrough
