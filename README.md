# Libert 📖
Get ebooks for free, easily.

## Set up
Clone, Go into the directory and run `npm install`

## Current Usage
Right now, it allows you to search for a book.

- Go to `libert ` folder
- Run `npm start "search query"`
- It looks up the book on google books.
- When you're asked `Download`, enter `y` and press enter to get a list of results for downloading the book.
- When asked `which_one`, enter one of the numbers formatted as `|||"number"|||` Downloads first option by default.
- When asked `action`, enter `k` for downloading on your kindle, or leave blank for downloading it to your computer.  By default, it will download to `installation-folder/Downloads` in the chosen format.

## To-Do
- Complete front end app.
- Full Google API usage, with
  1. User Data
  2. Recommendations
  3. Previews
- Conversion from and to different ebook formats
- Add to npm registry



## Contributing

Try to stick to the To-Do, open an issue if you have an idea for a new feature. If you've added something cool, email `s@jajoosam.tech` to notify me, and we'll try to merge :smile:



## Disclaimer

All libert does is fetch books from gen.lib.rus.ec, with a different UI. It is designed to make using the source easier, and does not host anything itself. I, Samarth Jajoo, claim no responsibility for any materials hosted at the source.
