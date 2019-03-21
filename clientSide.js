const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://example:SCRAM@denzel-nmus5.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "example";

const imdb = require("./src/imdb");
const ID_BDD = "nm0000243";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(3000, () => {
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

function html(result){
  if(typeof(result.review)=='undefined'){
      result.review='There is no review.';
  }
    return `<html>
            <head> <font size="6"><b> Denzel Washington's random must-watch movie </b></font></head>
            <br/>
            <body align="center"> <br/>
            <p> <b> Title:</b> ` + result.title + `  </p>
            <br/>
            <p> <b>Synopsis:</b> ` + result.synopsis + ` </p>
            <br/>
             <img src=` + result.poster + `> </img>
            <br/>
            <p> <b>Metascore:</b>  ` + result.metascore + ` </p>
            <br/>
            <p> <b>Review:</b>  ` + result.review + ` </p>
            <br/>
            <p> <b>IMDb: </b> <a href=` + result.link +` target="_blank">`+result.title+`</a> </p>
            <br/>
            <button id="refresh" onclick="location.reload();"> Refresh </button>
            <br/>
            </body>
            </html> `

}

app.get("/movies/populate", async (request, response) => {
  var count = await count_();
  if(count >= 56){ console.log("Database already populate!");
        response.send("Database already populate!");
      }else{
  const denzel = await imdb(ID_BDD);
  collection.insertMany(denzel, (err, result) => {
    if (err) {
      return response.status(500).send(err);
    }
    response.send("Populate complete! => " + denzel.length + " films!");
  });
  }
});

app.get("/", (request, response) => {
  collection.find({"metascore":{$gte:70}}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        let random = Math.floor(Math.random() * Math.floor(result.length));
        response.send(html(result[random]));
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
