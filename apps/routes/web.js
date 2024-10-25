const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticatetoken')

// Các routes cho quản lý web

router.get('/login', (req, res) => {
    res.render('login.ejs');
});


router.get('/', authenticate.checkcookies,(req, res) => {
    res.render('layout.ejs');
});

router.get('/list-table', (req,res)=>{
    res.render('list-table.ejs');
})

module.exports = router;