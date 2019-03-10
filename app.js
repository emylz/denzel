const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://example:SCRAM@denzel-nmus5.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "example";

const imdb = require("./src/imdb");
const DENZEL_IMDB_ID = "nm0000243";



var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

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

app.get("/movies/populate", async (request, response) => {
  const denzel = await imdb(DENZEL_IMDB_ID);
  collection.insertMany(denzel, (err, result) => {
    if (err) {
      return response.status(500).send(err);
    }
    response.send(`${denzel.length}`);
  });
});

app.get("/movies/:id", (request, response) => {
  collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
