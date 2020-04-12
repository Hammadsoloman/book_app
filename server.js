'use strict';


require('dotenv').config();

//dependencies
const express = require('express');
const superagent = require('superagent');


//PORT
const PORT = process.env.PORT || 4000;

//the App
const app = express();

//
app.use(express.static('./public'));

//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
app.set('view engine', 'ejs');


//test route
app.get('/hello', (request, response) => {
    response.render('pages/index');
})

//search route
app.get('/new', (request, response) => {
    response.render('pages/searches/new');
})


app.post('/searches', (request, response) => {
    let url;
    let mainSearch = request.body.search;
    let radioChoose = request.body.type;
  
    if (radioChoose === 'title') {
        url = `https://www.googleapis.com/books/v1/volumes?q=${mainSearch}`;
    }
    else {
        url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${mainSearch}`
        console.log('author')
    };

    console.log(url)
    superagent.get(url)
        .then(data => {
            let myBooks = data.body.items.map(selectBook => {
                return new Books(selectBook)
            })

            response.render('pages/searches/show', { book: myBooks });
        })
})


function Books(data) {
    this.title = data.volumeInfo.title;
    this.image = (data.volumeInfo.imageLinks && data.volumeInfo.imageLinks.thumbnail) || 'https://via.placeholder.com/250.png/DDD/000';
    this.authors = (data.volumeInfo.authors && data.volumeInfo.authors[0]) || 'there is no name';
    this.description = data.volumeInfo.description;
}



app.get('*', (request, response) => {
    response.status(404).send('NOT FOUND');
})

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
})