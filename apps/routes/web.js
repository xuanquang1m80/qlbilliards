const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticatetoken')

// Các routes cho quản lý web

router.get('/login', (req, res) => {
    res.render('login.ejs');
});


router.get('/',authenticate.checkcookies,(req, res) => {
    res.render('layout.ejs');
});

router.get('/home',authenticate.checkcookies, (req,res)=>{
    res.render('home.ejs');
});


router.get('/invoice',authenticate.checkcookies,(req,res)=>{
    res.render('invoices.ejs');
});

router.get('/managertable',authenticate.checkcookies,(req,res)=>{
    res.render('list-table.ejs')
})

router.get('/statistic',authenticate.checkcookies,(req,res)=>{
    res.render('statistical.ejs');
})

router.get('/booking',authenticate.checkcookies, (req,res)=>{
    res.render('booking-table.ejs');
})

module.exports = router;