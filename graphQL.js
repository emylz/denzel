const express = require('express');
const graphqlHTTP = require('express-graphql');
const {GraphQLSchema} = require('graphql');
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const _ = require('lodash');

const CONNECTION_URL = "mongodb+srv://**:**@denzel-nmus5.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "example";

const imdb = require("./src/imdb");
const ID_BDD = "nm0000243";


const port = 9292;
const app = express();


app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection, data;

app.listen(port, () => {
  MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }

        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel");
        console.log(`Connected to ${DATABASE_NAME} !`);
    });
});

app.get('/hello', (req,res) => {
    res.send("hello");
   });

   const { GraphQLObjectType,
       GraphQLString,
       GraphQLInt,
       GraphQLList
   } = require('graphql');

const {movieType}=require('./type.js');



const queryType = new GraphQLObjectType({
    name: 'Queries',
    fields: {
        hello: {
            type: GraphQLString,

            resolve: function () {
                return "Hello World";
            }
        },
        moviesDelete:{
            type: GraphQLString,

            resolve: function(source, args){
              collection.deleteMany({});
              return "Clear !";
          }
        },
        moviesInsert:{
          type: GraphQLString,

          resolve: async function(){
            let count = await collection.countDocuments();
            if(count >= 56) return "Already populate !";
            var denzel = await imdb(ID_BDD);
            collection.insertMany(denzel);
            count = await collection.countDocuments();
            return "Populate complete! => There are "+ count.toString() + " films!";
          }

        },
        movies:{
          type: movieType,
          args: {
              id: { type: GraphQLString }
          },
          resolve: async function (source, args) {
                data = await collection.find().toArray();
                return _.find(data, { id: args.id });
            }
        },
        moviesRandom:{
          type: movieType,
          resolve: async function () {
                data = await collection.find({"metascore":{$gte: 70}}).toArray();
                let num = Math.floor(Math.random() * Math.floor(data.length));
                return data[num];
            }
        },
        moviesSearch:{
          type: new GraphQLList(movieType),
          args: {
              limit: { type: GraphQLString },
              metascore:{ type: GraphQLString }
          },
          resolve: async function (source, args) {
                let meta = 0, limit = 5;
                meta=Number(args.metascore);
                if(meta>100) meta=100;
                if(Number(args.limit)<=5) limit=Number(args.limit);
                data = await collection.find({"metascore":{$gte: meta}}).sort({"metascore":-1}).toArray();
                var output =[];
                for(let i = 0; i < limit; i++)
                {
                  if(data[i]!=null){
                    output.push(data[i]);
                  }
                }
                return output;
            }
        },
        moviesReview:{
          type: movieType,
          args: {
              date: { type: GraphQLString },
              review:{ type: GraphQLString },
              id:{type:GraphQLString}
          },
          resolve: async function (source, args) {
            collection.updateOne({"id":args.id},{ $set:{"date":args.date, "review":args.review} });
            data = await collection.find().toArray();
            return _.find(data, { id: args.id });
            }
        }

    }
});

const schema = new GraphQLSchema({ query: queryType });

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));
