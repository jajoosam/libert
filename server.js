// server.js
// where your node app starts

// express
var express = require('express');
var app = express();
// other dependencies
var fs = require('fs');
var libgen = require('libgen');
var books = require('google-books-search');
var JSONdb = require('simple-json-db');
var output = {};
var cache = false;
var id = "";


// cache
const db = new JSONdb("bla.json");

// libgen options
var options = {
    mirror: "http://gen.lib.rus.ec",
    query: "",
    author: "",
};

libgen.mirror(function(err,urlString){
  if (err)
    return console.error(err);
  options.mirror=urlString;
  return console.log(urlString + ' is currently fastest');
});

// starting express
app.use(express.static('public'));
app.set('view engine', 'pug');

//index
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//about
app.get("/about", (req, res) => {
  res.sendFile(__dirname + "/about.html");
});

// app
app.get("/:keyword", (req, res) => {
  options.query = req.params.keyword;
    books.search(options.query, function(error, results) {
      if ( ! error && results[0]) {
        id = results[0].id;
        console.log("IDENTITY: " + id);
        // cache check
        if(db.has(id)){
          cache = true;
          console.log("from cache")
          res.render("index", db.get(id));
          return;
        }
        
         // book info
         output.title = results[0].title ;
         output.author = results[0].authors;
         output.publisher = results[0].publisher;
         output.publishedDate = results[0].publishedDate;
         output.pages = results[0].pageCount;
         output.rating = results[0].averageRating;
         output.description = results[0].description;
         output.image = results[0].thumbnail;
         
         if(results[0].authors === undefined){
           res.sendFile(__dirname + "/error.html");
           return;
         }
        // setting libgen search option
        options.query = results[0].title + " " + results[0].authors[0];
        // reading libgen results
          // dummy links for verification
          output.mobi = false;
          output.epub = false;
          output.pdf = false;
              libgen.search(options, (err, data) => {
                
                if (err)
                  res.sendFile(__dirname + "/error.html");
                  console.log(data);
                  
                  
                if(data===undefined){
                  res.sendFile(__dirname + "/error.html");
                  console.log(data);
                  return;
                }
                
                var n = data.length;
                // link to actual download links
                while (n--){
                  if(data[n].extension == "mobi" && output.mobi == false){
                    output.mobi = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                  if(data[n].extension == "epub" && output.epub == false){
                    output.epub = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                  if(data[n].extension == "pdf" && output.pdf == false){
                    output.pdf = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                }
                if(cache===false){
                  db.set(id, output);
                }
                res.render("index", output);

            });
            
          
      } else {
          res.sendFile(__dirname + "/error.html");
      }
    });
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

