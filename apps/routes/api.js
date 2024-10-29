// routes/api.js
const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');
const tablecontroller = require('../controllers/tablecontroller');
const servicecontroller = require('../controllers/servicecontroller');

//------------ Các routes cho quản lý API----------------



//xử lý login 
router.post('/auth', authcontroller.login)


//Get danh sách table 
router.get('/table',tablecontroller.listtable)


//Get danh sách loại bàn
router.get('/table-types',tablecontroller.listtype)

//Xử lý thêm mới bàn
router.post('/create-table',tablecontroller.addtable)


//Get danh sách loại dịch vụ
router.get('/service-type',servicecontroller.listtype)


//Get danh sách theo loại dịch vụ
router.get('/service/type/:typeId',servicecontroller.getServicesByTypeId)


//Get Table Usage Detail
router.get('/getTableDetails/:id',tablecontroller.getTableUsage)

//Add Service Usage 
router.post('/add-service',servicecontroller.addServiceUsage)

//Get List Customer 
router.get('/customer', servicecontroller.getCustomer)


//Calculate and Save 
router.post('/calculateandsave',tablecontroller.calculateAndSave)

//Tính tiền
router.post('/payment', tablecontroller.payment)

//Xuất hóa đơn 
router.get('/getInfoInvoice',tablecontroller.getInfoInvoice)
module.exports = router;
