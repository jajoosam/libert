// server.js
// where your node app starts

// express
var express = require('express');
var app = express();
// other dependencies
var fs = require('fs');
var libgen = require('libgen');
var books = require('google-books-search');
var googl = require('goo.gl');
var output = {};

// goo.gl auth
googl.setKey('AIzaSyB-1qsQrieCoz_TPtrFJ4W3IlcSsrQ4drY');

// libgen options
var options = {
    mirror: 'http://libgen.io',
    query: "",
    author: "",
};

// starting express
app.use(express.static('public'));
app.set('view engine', 'pug');

// app
app.get("/:keyword", (req, res) => {
  options.query = req.params.keyword;
    books.search(options.query, function(error, results) {
      if ( ! error ) {
         // book info
         output.title = results[0].title ;
         output.author = results[0].authors;
         output.publisher = results[0].publisher;
         output.publishedDate = results[0].publishedDate;
         output.pages = results[0].pageCount;
         output.rating = results[0].averageRating;
         output.description = results[0].description;
         output.image = results[0].thumbnail;
         console.log(output);
        // setting libgen search option
        options.query = results[0].title + " " + results[0].authors[0];
        // reading libgen results
          // dummy links for verification
          output.mobi = false;
          output.epub = false;
          output.pdf = false;
              libgen.search(options, (err, data) => {
                console.log(data);
                if (err)
                  return err
                  var n = data.length;
                // link to actual download links
                while (n--){
                  if(data[n].extension == "mobi" && output.mobi == false){
                    output.mobi = 'http://libgen.io/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                  if(data[n].extension == "epub" && output.epub == false){
                    output.epub = 'http://libgen.io/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                  if(data[n].extension == "pdf" && output.pdf == false){
                    output.pdf = 'http://libgen.io/get.php?md5=' + data[n].md5.toLowerCase();
                  }
                }
                res.render("index", output);

            });
            
          
      } else {
          console.log(error);
      }
  });
  
  
  

  console.log(output)
  
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
