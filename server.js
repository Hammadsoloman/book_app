'use strict';
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 5050;
=======

const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const superagent = require('superagent');
const pg = require('pg');


app.use(express.static('./public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);
app.set('view engine', 'ejs');
var bookgallery = [];

app.get('/', (req, res) => {
    res.redirect('/index')
})
app.get('/index', (req, res) => {
    let SQL = 'SELECT * FROM books;';
    return client.query(SQL)
        .then(results => {
            res.render('pages/index', { books: results.rows });
        })

})

app.get('/search', (req, res) => {
    res.render('pages/searches/new')
})


app.post('/searches', (req, res) => {

    var url;
    if (req.body.searchtype === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.bookname}&intitle:${req.body.bookname}`;
    }
    else if (req.body.searchtype === 'author') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.bookname}+inauthor:${req.body.bookname}`;
    }

    superagent.get(url)
        .then(data => {
            let arr = data.body.items;
            let books = arr.map(book => {
                let bookitem = new Book(book);
                bookgallery.push(bookitem);
                return bookitem;
            });
            res.render('pages/searches/detail', { books: books })
        })
        .catch(error => {
            res.render('pages/error');
        });
});

app.get('/books/:book_id', getbookDetails);
function getbookDetails(req, res) {
    let SQL = 'SELECT * FROM books WHERE id=$1;';
    let values = [req.params.book_id];
    return client.query(SQL, values)
        .then(result => {

            res.render('pages/book/detail', { details: result.rows[0] });
        })

}

app.post('/books', insertDetails);

function insertDetails(req, res) {
    let { title, author, isbn, image_url, description,bookshelf} = req.body;
    console.log(req.body.title);
    let SQL = 'INSERT INTO books (title,author,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    let safeValues = [title, author, isbn, image_url, description,bookshelf];
    return client.query(SQL, safeValues)
        .then(() => {
            res.redirect('/index');
        })

}

app.delete('/delete/:details_id', deletebook);
app.put('/update/:details_id',updatebook);

function updatebook(req,res)
{
    let { title, author, isbn, image_url, description,bookshelf} = req.body;
    let SQL = 'UPDATE books SET title=$1,author=$2,isbn=$3,image_url=$4,description=$5,bookshelf=$6 WHERE id=$7;';
    let safeValues = [title, author, isbn, image_url, description,bookshelf,req.params.details_id];
    return client.query(SQL, safeValues)
        .then(() => {
            res.redirect(`/books/${req.params.details_id}`);
        })
}
function deletebook(req, res) {
    let SQL = "DELETE FROM books WHERE id=$1;";
    let safeValue = [req.params.details_id];
    client.query(SQL, safeValue)
        .then(res.redirect('/'));
}


function insertDetails(req,res) {
    let {title,author,isbn,image_url,description} = req.body;
    let SQL = 'INSERT INTO books (title,author,isbn,image_url,description) VALUES ($1,$2,$3,$4,$5);';
    let safeValues = [title,author,isbn,image_url,description];
    return client.query(SQL,safeValues)
    .then (()=>{
        res.redirect('/index');
    })
        
 }
function Book(book) {
    this.title = book.volumeInfo.title;
    this.smallThumbnail = book.volumeInfo.imageLinks.smallThumbnail;
    this.authors = book.volumeInfo.authors;
    this.description = book.volumeInfo.description;
    this.isbn = book.volumeInfo.industryIdentifiers[0].type;
    this.isbn=book.volumeInfo.industryIdentifiers[0].type;
}
app.get('*', (req, res) => {
    res.status(404).send('This route does not exist!!');
})

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`);
        })
    })

