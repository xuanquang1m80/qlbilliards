require('dotenv').config();
const mongoose = require('mongoose');

const username = process.env.DB_USER;
const pass = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;


const uri = `mongodb+srv://${username}:${pass}@myfirstdb.5pbnm.mongodb.net/${database}?retryWrites=true&w=majority&appName=MyFirstDB`;


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Thoát chương trình nếu kết nối thất bại
    }
};

  
module.exports = connectDB;