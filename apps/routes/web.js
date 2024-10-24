const express = require('express');
const router = express.Router();

// Các routes cho quản lý web
router.get('/login', (req, res) => {
    res.render('login.ejs');
});


router.get('/', (req, res) => {
    res.render('layout.ejs');
});

module.exports = router;