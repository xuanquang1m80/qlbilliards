const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const CustomerSchema = new Schema({
    name: String,
},{
    collection: 'customer-type'
})


const CustomerTypeModel = mongoose.model('customer-type',CustomerSchema)

module.exports = CustomerTypeModel;