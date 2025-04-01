// routes/api.js
const express = require('express');
const router = express.Router();

const authcontroller = require('../controllers/authcontroller');
const tablecontroller = require('../controllers/tablecontroller');
const servicecontroller = require('../controllers/servicecontroller');
const bookingcontroller = require('../controllers/bookingcontroller');
const authenticate = require('../middleware/authenticatetoken')
const { route } = require('./web');

//------------ Các routes cho quản lý API----------------



//xử lý login 
router.post('/auth', authcontroller.login)


//Get danh sách table 
router.get('/table',authenticate.checkcookies,tablecontroller.listtable)


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

//Api get tablelist for manager table
router.get('/gettablelist',tablecontroller.getTableList)

//Get detail tables
router.get('/tables/:id', tablecontroller.getDetailTable)

router.put('/update-table/:id',tablecontroller.updatedTable )

// Lấy ra tổng số bàn, bàn đang sử dụng 
router.get('/overview', tablecontroller.overview)

//Get doanh thu các tháng
router.get('/revenue/monthly',tablecontroller.calculateMonthlyRevenue)

//Get Khách hàng đã thanh toán trong ngày
router.get('/invoices/today',tablecontroller.getInvoicesForToday)

router.put('/updateInvoice',tablecontroller.updateInvoice)

//Lấy tất cả danh sách bàn
router.get('/tableandcustomer',bookingcontroller.tableandcustomer)

// ADD Booking Table 
router.post('/addbooking',authenticate.checkcookies, bookingcontroller.addbooking)

//Get List Booking 
router.get('/getbooking',bookingcontroller.listbooking)
//Get Detail Booking
router.get('/getbooking/:id', bookingcontroller.detailbooking)

//Delete Booking 
router.delete('/delbooking/:id',bookingcontroller.deletebooking)

router.get('/cancelbooking/:id',bookingcontroller.canclebooking)

//Nhận Bàn từ bàn đặt
router.post('/receitable', bookingcontroller.receibooking)

module.exports = router;
