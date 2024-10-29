const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const ServiceTypeSchema = new Schema({
    name: String
},{
    collection: 'service-type'
})


const ServiceTypeModel = mongoose.model('service-type',ServiceTypeSchema)

module.exports = ServiceTypeModel;