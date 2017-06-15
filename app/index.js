// app/index.js
var fs = require('fs');
var libgen = require('libgen');
var books = require('google-books-search');
var prompt = require('prompt');
var open =  require("opn");
var googl = require('goo.gl');
var book = "";
googl.setKey('AIzaSyB-1qsQrieCoz_TPtrFJ4W3IlcSsrQ4drY');
prompt.start();

//
// Get two properties from the user: username and email
//
  var options = {
    mirror: 'http://gen.lib.rus.ec',
    query: "",
    author: "",
  };
  for(i= 2; i<process.argv.length; i++){
    options.query += process.argv[i] + " ";
  }
  books.search(options.query, function(error, results) {
      if ( ! error ) {
          info = "Title: " + results[0].title + "\nAuthor: " + results[0].authors + "\nPublished by " + results[0].publisher + " on " + results[0].publishedDate + "\nPages: " + results[0].pageCount + "\nRating: " + results[0].averageRating + "\n***\nDescription:\n" + results[0].description + "\n***";
          console.log(info);
          options.query = results[0].title + " " + results[0].authors;
          prompt.get(['Download'], function (err, result) {
            if(result.Download == "y"){
              libgen.search(options, (err, data) => {
                if (err)
                  return err
                  var n = data.length;
                console.log(n + ' "' +options.query + '" books');
                while (n--){
                  console.log('***********');
                  console.log("|||"+n+"|||");
                  console.log('Title: ' + data[n].title);
                  console.log('Author: ' + data[n].author);
                  console.log('Format: ' + data[n].extension);
                  console.log('Download: ' +
                              'http://gen.lib.rus.ec/get.php?md5=' +
                              data[n].md5.toLowerCase());
              }
              prompt.get(['which_one'], function (err, result) {
                googl.shorten('http://gen.lib.rus.ec/get.php?md5=' + data[+result.which_one].md5.toLowerCase())
                    .then(function (shortUrl) {
                        console.log("To get this on your Kindle, open the experimental browser, and go to " + shortUrl);
                    })
                open('http://gen.lib.rus.ec/get.php?md5=' + data[+result.which_one].md5.toLowerCase());
            });
            });
            }
          });
      } else {
          console.log(error);
      }
  });
