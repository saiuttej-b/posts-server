# Posts Backend Server

## Description

This is a backend server for the Posts application. It is built using Nestjs and uses a MongoDB database. It uses AWS S3 for storing images and files.

## Features

Application features include:

- Post CRUD operations
- File upload and download
- One Post includes a title, short description and image. Post's content include creation of multiple records of text and files.

## Requirements

- Nestjs
- MongoDB
- AWS S3
- Typescript

## Installation

```bash
$ npm install
```

## Running the app

### Development Mode

```bash
$ npm run start
(or)
$ yarn start

$ npm run start:dev
(or)
$ yarn start:dev
```

### Production mode

```bash
# Build
$ npm run build
(or)
$ yarn build
# Run
$ npm run start:prod
(or)
$ yarn start:prod
```
