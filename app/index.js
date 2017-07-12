// app/index.js
var fs = require('fs');
var libgen = require('libgen');
var books = require('google-books-search');
var prompt = require('prompt');
var open = require("opn");
var googl = require('goo.gl');
var download = require('download');
var ProgressBar = require('progress');
var chalk = require('chalk');
var book = "";
googl.setKey('AIzaSyB-1qsQrieCoz_TPtrFJ4W3IlcSsrQ4drY');
prompt.start();
var bar = new ProgressBar('Downloading: [:bar] :percent :etas', {
  compbare: '=',
  incompbare: ' ',
  width: 20,
  total: 0
});
var options = {
  mirror: 'http://gen.lib.rus.ec',
  query: "",
  author: "",
};
for (i = 2; i < process.argv.length; i++) {
  options.query += process.argv[i] + " ";
}
books.search(options.query, function(error, results) {
  if (!error) {
    info = chalk.yellow("Title: ") + results[0].title + chalk.green("\nAuthor: ") + results[0].authors + chalk.red("\nPublished by ") + results[0].publisher + " on " + chalk.cyan(results[0].publishedDate) + chalk.blue("\nPages: ") + results[0].pageCount + chalk.magenta("\nRating: ") + results[0].averageRating + chalk.gray("\n***\nDescription:\n") + results[0].description + "\n***";
    console.log(info);
    options.query = results[0].title + " " + results[0].authors;
    prompt.get(['Download'], function(err, result) {
      if (result.Download == "y" || "yes") {
        libgen.search(options, (err, data) => {
          if (err) {
            console.log(chalk.bold.blue('No download links found 😔'));
            console.log(chalk.blue('Please try searching for another book 🤞'));
            return err;
          }
          var n = data.length;
          console.log(chalk.magenta(n + ' "' + options.query + '" books found'));
          while (n--) {
            console.log('***********');
            console.log(chalk.red("|||" + (n) + "|||"));
            console.log(chalk.bold.cyan('Title: ' + data[n].title));
            console.log(chalk.green('Author: ' + data[n].author));
            console.log(chalk.italic('Format: ' + data[n].extension + '\n'));
          }
          prompt.get(['which_one', 'kindle_version'], function(err, result) {
            if (result.kindle_version == "y") {
              googl.shorten('http://gen.lib.rus.ec/get.php?md5=' + data[result.which_one].md5.toLowerCase()).then(function(shortUrl) {
                console.log(chalk.blue('To get this on your Kindle, open the experimental browser, and go to ' + chalk.bold.magenta(shortUrl)));
              })
            } else {
              var successStatements = ['Done. We hope you love the book. 🤞', 'Thats a great choice. 😉', 'That books sounds interesting 😍'];
              var randomString = Math.floor(Math.random() * successStatements.length);
              download('http://gen.lib.rus.ec/get.php?md5=' + data[+result.which_one].md5.toLowerCase(), 'Downloads').on('response', res => {
                bar.total = res.headers['content-length'];
                res.on('data', data => bar.tick(data.length));
              }).then(() => console.log(chalk.bold.blue(successStatements[randomString])));
            }
          });
        });
      }
    });
  } else {
    console.log(error);
  }
});