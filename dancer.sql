-- DROP TABLE IF EXISTS stages;
-- DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  profile_pic TEXT NOT NULL
);

CREATE TABLE stages (user TEXT, stageName TEXT, details TEXT, stageId INT);

INSERT INTO stages (user, stageName, details, stageId)
   VALUES ('Janet','Dance1','The Practice of Programming',40);
INSERT INTO stages (user, stageName, details, stageId)
   VALUES ('Janet','Dance2','The C Programming Language',24);
INSERT INTO stages (user, stageName, details, stageId)
   VALUES ('Sedgewick','Dance3','Algorithms in C',61);
