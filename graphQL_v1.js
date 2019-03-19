const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');
const {ExecutableSchema} =require ('graphql-tools');
const cors =require ('cors');
const graphqServerExpress= require ('graphql-server-express');

const CONNECTION_URL = "mongodb+srv://example:SCRAM@denzel-nmus5.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "example";

const imdb = require("./src/imdb");
const ID_BDD = "nm0000243";

var app = Express();

app.listen(9292, () => {
  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }

        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel");
        console.log(`Connected to ${DATABASE_NAME} !`);
    });
});

const def = [`
      schema {
          query Query
      }

      type Query {
          movies: [Movie]
          movie: Movie
      }

      type Movie {
          link: String
          metascore: Int
          synopsis: String
          title: String
          year: Int
      }
    `];

const resolvers = {

}

const sch = ExecutableSchema({
     def,
     resolvers
   });
