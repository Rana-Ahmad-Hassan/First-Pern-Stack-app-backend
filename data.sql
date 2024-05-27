CREATE DATABASE todo;


CREATE TABLE todos(
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255),
    title VARCHAR(300),
    date VARCHAR(300)
);


CREATE TABLE users(
    name VARCHAR(30),
    email VARCHAR(255) PRIMARY KEY,
    hashed_password VARCHAR(255)
);

