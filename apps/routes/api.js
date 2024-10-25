// routes/api.js
const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');
const tablecontroller = require('../controllers/tablecontroller');

//------------ Các routes cho quản lý API----------------



//xử lý login 
router.post('/auth', authcontroller.login)


//Get danh sách table 
router.get('/table',tablecontroller.listtable)


//Get danh sách loại bàn
router.get('/table-types',tablecontroller.listtype)

//Xử lý thêm mới bàn
router.post('/create-table',tablecontroller.addtable)





module.exports = router;
