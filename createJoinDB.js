var mysqlx = require('mysqlx');

var session = mysqlx.getSession('root:Simp50n5!@localhost');

session.dropSchema('joindb');
var schema = session.createSchema('joindb');

var flintCol = schema.createCollection('flintstones');
var simpCol  = schema.createCollection('simpsons');

flintCol.add({"_id": "1000", "name": "Fred",   "type": "Early human"}).execute();
flintCol.add({"_id": "1001", "name": "Barney", "type": "Early human"}).execute();
flintCol.add({"_id": "1002", "name": "Dino",   "type": "Dinosaur"}).execute();
flintCol.add({"_id": "1003", "name": "Wilma",  "type": "Developed human", "brain": true}).execute();

simpCol.add({"_id": "5101", "name": "Homer", "geneBias": "Early human"}).execute();
simpCol.add({"_id": "5102", "name": "Marge", "geneBias": "Developed human"}).execute();
simpCol.add({"_id": "5103", "name": "Bart", "geneBias": "Early human"}).execute();
simpCol.add({"_id": "5104", "name": "Lisa", "geneBias": "Developed human"}).execute();
simpCol.add({"_id": "5105", "name": "Maggie", "geneBias": "No discernable bias, probably human"}).execute();
simpCol.add({"_id": "5106", "name": "Santa's little helper", "geneBias": "Dinosaur"}).execute();

// Create traditional SQL tables
// In the session context the full SQL
session.sql('USE joindb').execute();
session.sql('CREATE TABLE skills (  \
                id INT PRIMARY KEY, \
                skill VARCHAR(40) NOT NULL)').execute();

session.sql('INSERT INTO skills VALUES (1,"Fire starting")').execute();
session.sql('INSERT INTO skills VALUES (2,"Beer drinking")').execute();
session.sql('INSERT INTO skills VALUES (3,"Poetry")').execute();
session.sql('INSERT INTO skills VALUES (4,"Car driving (foot mobile)")').execute();
session.sql('INSERT INTO skills VALUES (5,"Gas production")').execute();
session.sql('INSERT INTO skills VALUES (6,"Rock bashing")').execute();

session.sql('CREATE TABLE skills_matrix (                            \
                id INT PRIMARY KEY AUTO_INCREMENT PRIMARY KEY,       \
                person_id VARBINARY(32) NOT NULL,                    \
                skill_id INT NOT NULL,                               \
                FOREIGN KEY (person_id) REFERENCES flintstones(_id), \
                FOREIGN KEY (skill_id)  REFERENCES skills(id))').execute();

session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1000, 1)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1000, 2)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1000, 4)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1000, 5)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1000, 6)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1001, 1)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1001, 2)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1001, 5)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1001, 6)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1002, 5)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1003, 1)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1003, 3)').execute();
session.sql('INSERT INTO skills_matrix (person_id, skill_id) VALUES (1003, 4)').execute();

// Print a summary of what has been created.

var columnNames = null;
var row = null;
var res = simpCol.find().execute();
print("\n\n THE JOINDB SCHEMA\n");
print(" =================\n");
print("\n\n SIMPSON COLLECTION\n");
print(res.fetchAll());

res = flintCol.find().execute();
print("\n\n FLINTSTONE COLLECTION\n");
print(res.fetchAll());

res = session.sql('SELECT * FROM skills').execute();
print("\n\n  SKILLS TABLE\n");
columnNames = res.getColumnNames();
print(" " + columnNames[0] + "\t" + columnNames[1] + "\n");
while (row = res.fetchOne()) {
        print(" " + row[columnNames[0]] + "\t" + row[columnNames[1]] + "\n");
}

// Note - no need to print primary key (which would be the first column)
res = session.sql('SELECT * FROM skills_matrix').execute();
print("\n\n  SKILLS MATRIX TABLE\n");
columnNames = res.getColumnNames();
print(" " + columnNames[1] + "\t" + columnNames[2] + "\n");
while (row = res.fetchOne()) {
        print(" " + row[columnNames[1]] + "\t\t" + row[columnNames[2]] + "\n");
}

session.close();
