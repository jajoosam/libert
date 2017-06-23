// app/index.js
var fs = require('fs');
var libgen = require('libgen');
var books = require('google-books-search');
var prompt = require('prompt');
var open =  require("opn");
var googl = require('goo.gl');
let download = require('download');
let ProgressBar = require('progress');
var chalk = require('chalk');
var book = "";
googl.setKey('AIzaSyB-1qsQrieCoz_TPtrFJ4W3IlcSsrQ4drY');
prompt.start();

//
// Get two properties from the user: username and email
//
  let bar = new ProgressBar('Downloading: [:bar] :percent :etas', {
              complete: '=',
              incomplete: ' ',
              width: 20,
              total: 0
  });

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
                console.log(chalk.magenta(n + ' "' +options.query + '" books found'));
                while (n--){
                  console.log('***********');
                  console.log(chalk.red("|||"+(n)+"|||"));
                  console.log(chalk.bold.cyan('Title: ' + data[n].title));
                  console.log(chalk.green('Author: ' + data[n].author));
                  console.log(chalk.italic('Format: ' + data[n].extension + '\n'));
              }
              prompt.get(['which_one', 'action'], function (err, result) {
                if (result.action == "k") {
                  googl.shorten('http://gen.lib.rus.ec/get.php?md5=' + data[result.which_one].md5.toLowerCase())
                      .then(function (shortUrl) {
                          console.log("To get this on your Kindle, open the experimental browser, and go to " + shortUrl);
                      })
                }
                else{
                  var successStatements = [
                      'Done. We hope you love the book. 🤞',
                      'Thats a great choice. 😉',
                      'That books sounds interesting 😍'
                  ];
                  var randomString = Math.floor(Math.random()*successStatements.length);
                  download('http://gen.lib.rus.ec/get.php?md5=' + data[+result.which_one].md5.toLowerCase(), 'Downloads')
                  .on('response', res => {
                    bar.total = res.headers['content-length'];
                    res.on('data', data => bar.tick(data.length));
                  })
                  .then(() => console.log(chalk.bold.blue(successStatements[randomString])));
                }
            });
            });
            }
          });
      } else {
          console.log(error);
      }
  });
