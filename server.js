'use strict';

require('dotenv').config();
const express = require('express');

const PORT = process.env.PORT || 3030;
const app = express();

app.use(express.static('./public'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.get('/',(req,res)=>{
    res.render('pages/index');
})
app.get('*',(req,res)=>{
    res.status(404).send('cannot see your result');
})

app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`)
})
