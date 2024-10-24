// routes/api.js
const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');


// Các routes cho quản lý API
router.get('/students', (req, res) => {
    // Trả về danh sách sinh viên (dữ liệu giả lập)
    const students = [
        { id: 1, name: 'John Doe', age: 21 },
        { id: 2, name: 'Jane Doe', age: 22 }
    ];
    res.json(students);
});


//xử lý login 
router.post('/auth', authcontroller.login)

//xử lý check token
router.post('/check-token', authcontroller.authtoken)



module.exports = router;
