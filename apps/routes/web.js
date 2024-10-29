const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticatetoken')

// Các routes cho quản lý web

router.get('/login', (req, res) => {
    res.render('login.ejs');
});


router.get('/',(req, res) => {
    res.render('layout.ejs');
});

router.get('/home', (req,res)=>{
    res.render('home.ejs');
});


router.get('/invoice',(req,res)=>{
    res.render('invoices.ejs');
});

router.get('/managertable',(req,res)=>{
    res.render('list-table.ejs')
})

router.get('/statistic',(req,res)=>{
    res.render('statistical.ejs');
})

module.exports = router;