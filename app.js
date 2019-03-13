const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://**:**@denzel-nmus5.mongodb.net/test?retryWrites=true";
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

app.post("/movies/delete", async (request, response) => {
  collection.deleteMany({}, function(err, obj) {
    if (err) return response.status(500).send(err);
    response.send("Clear !");
  });
});

async function count_(){
  let c = 0;
  await collection.countDocuments().then((count) => {
  c = count;
  });
return c;
}

app.get("/movies/populate", async (request, response) => {
  var count = await count_();
  if(count >= 56){ console.log("Database already populate!");
        response.send("Database already populate!");
      }else{
  const denzel = await imdb(DENZEL_IMDB_ID);
  collection.insertMany(denzel, (err, result) => {
    if (err) {
      return response.status(500).send(err);
    }
    response.send("Populate complete! => " + denzel.length + " films!");
  });
  }
});

app.get("/movies", (request, response) => {
  collection.find({"metascore":{$gte:70}}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        let random = Math.floor(Math.random() * Math.floor(result.length));
        response.send(result[random]);
    });
});

app.get("/movies/search", (request, response) => {
  let metascore=0;
  if(request.query["metascore"]!=null) {
    metascore=Number(request.query.metascore);
    if(metascore>100) metascore=100;
  }
  let limit=5;
  if(request.query["limit"]!=null && Number(request.query.limit)<=5) limit=Number(request.query.limit);
  collection.find({"metascore": {$gte: metascore}}).sort({"metascore":-1}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        var res = [];
        for(let i = 0; i < limit; i++)
        {
          if(result[i]!=null) res.push(result[i]);
        }
        response.send(res);
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

app.post("/movies/:id", (request, response) => {
  collection.updateOne({"id":request.params.id},{ $set:request.body },(error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
