require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var connectDB = require('./apps/database/connectDb');

// Import routes
const webRoutes = require('./apps/routes/web');
const apiRoutes = require('./apps/routes/api');

// app.use('/partical', express.static(__dirname + '/views/partical'));
app.set('views',__dirname + '/apps/views');
app.set('view engine', 'ejs');
app.use('/static', express.static(__dirname + '/public'));

// Tăng giới hạn tải lên cho body-parser
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));  // Tăng giới hạn lên 10MB
app.use(bodyParser.json({ limit: '10mb' }));  // Tăng giới hạn lên 10MB

//Import Cookies 
app.use(cookieParser())



//Kết nối database
connectDB();


// Sử dụng routes
app.use('/web', webRoutes); // Quản lý web
app.use('/api', apiRoutes); // Quản lý API


const port = process.env.PORT || 8081;

app.listen(port, function(){
 console.log('Server is running',+port); 
});