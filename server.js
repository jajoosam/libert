// server.js
// where your node app starts

// express
var express = require('express');
var app = express();
// other dependencies
var fs = require('fs');
var libgen = require('libgen');
var googleBooks = require('google-books-search');
var JSONdb = require('simple-json-db');


//cache
var _db;

// libgen options
var options = {
    mirror: "http://gen.lib.rus.ec",
    query: ""
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
  return;
});

//disclaimer
app.get("/disclaimer", (req, res) => {
  res.sendFile(__dirname + "/disclaimer.html");
  return;
});

// app
app.get("/:keyword", (req, res) => {
  var _query = options.query = req.params.keyword;

  console.log('loading books for...', _query);
    googleBooks.search(_query, function(error, results) {
      if ( ! error && results.length>0) {
        // cache
        const sanitizedQuery = _query.replace(/\s/g,'');
        _db = new JSONdb('cache/'+sanitizedQuery+'.json');

        // create standarized array of books:
        var books = [], i;
        // console.log('Standarizing results...', results.length);
        for(i=results.length-1; i>=0; i--) {
          var b = grabGoogleBook(results[i]);
          if(b) {
            console.log(' - G: '+b.title);
            books.push( b );
          }
        }

        if(books.length===0) { // no results found
          res.sendFile(__dirname + "/error.html");
        } else {
          // console.log('Loading data from LibGen...');
          // now find each book on LibGen...
          var promisedBooks = [];
          books.forEach(function(book) {
            promisedBooks.push( grabLibgenBook(book) );
          });

          // once we have all books information...
          Promise.all(promisedBooks).then((values) => {
            // console.log('Rendering results...', values.length);

            var validBooks = [];
            values.forEach(function(b){
              if(b!==null) {
                validBooks.push(b);
              }
            });
            
            if(validBooks.length>0) {
              res.render("index", {search: _query, books: values});
            } else {
              // no books found on LibGen :(
              res.sendFile(__dirname + "/error.html");
            }
          }).catch((err) => {
            console.error(err);
            res.sendFile(__dirname + "/error.html");
          });
        }
      } else {
          res.sendFile(__dirname + "/error.html");
      }
    });
});


function grabLibgenBook(book) {
  var promise = new Promise((resolve, reject) => {

    if(_db.has(book.id)) {
      // console.log(' - LG: ' + book.title + " is served from cache");
      var b = _db.get(book.id);
      b.cache = true;
      resolve(b);
    } else {
      options.query = book.title + ", " + book.author;
      // console.log(' - LibGen search:', options.query);
      libgen.search(options, (err, data) => {

        if (err) {
          // console.log(' - LibGen Error:', err.message);
          resolve(null);
          return false;
        }
          
        if(data===undefined) {
          console.log(" - LibGen - no data");
          resolve(null);
          return false;
        }

        var n = data.length;

        // link to actual download links
        while (n--){
          if(data[n].extension == "mobi" && book.mobi == false) {
            book.mobi = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
          }
          if(data[n].extension == "epub" && book.epub == false) {
            book.epub = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
          }
          if(data[n].extension == "pdf" && book.pdf == false) {
            book.pdf = options.mirror + '/get.php?md5=' + data[n].md5.toLowerCase();
          }
        }

        // add this book to query cache...
        _db.set(book.id, book);

        resolve(book);
      }); // finish libgen search
    }
  });

  return promise;
}

function grabGoogleBook(book) {
  // skip this book if we don't have complete data
  if(book.authors === undefined) {
     return false;
  }

  var output = {};
  output.id = book.id;
  output.title = book.title;
  output.author = book.authors[0];
  output.publisher = book.publisher;
  output.publishedDate = book.publishedDate;
  output.pages = book.pageCount;
  output.rating = book.averageRating;
  output.description = book.description;
  output.image = book.thumbnail;
   
  // setting libgen search option
  output.mobi = false;
  output.epub = false;
  output.pdf = false;

  return output;
}

// listen for requests :)
const PORT = process.env.port || 3000;
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

