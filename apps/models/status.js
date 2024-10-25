const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const StatusSchema = new Schema({
    name: String
},{
    collection: 'status'
})


const StatusModel = mongoose.model('status',StatusSchema)

module.exports = StatusModel;