'use strict';
require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 5050;
const app = express();
const superagent = require('superagent');

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('pages/index');
})
app.get('/search', (req, res) => {
    res.render('pages/searches/new.ejs')
})

app.post('/searches', (req, res) => {
    var url;
    if (req.body.myBook === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.bookname}&intitle:${req.body.bookname}`;
    }
    else if (req.body.myBook === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.bookname}&inauthor:${req.body.bookname}`;
    }

    superagent.get(url)
        .then(data => {
            let arr = data.body.items;
            let books = arr.map(book => {
                let bookitem = new Book(book);
                console.log(book.length);
                return bookitem;
            });
            res.render('pages/searches/show', { books: books })
        })
        .catch(error => {
            res.render('pages/error');
        });
});
function Book(book) {
    this.title = book.volumeInfo.title;
    this.smallThumbnail = book.volumeInfo.imageLinks.smallThumbnail;
    this.authors = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;

}
app.get('*', (req, res) => {
    res.status(404).send('You have a error in writing the route');
})

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})