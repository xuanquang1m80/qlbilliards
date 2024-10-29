const mongoose = require('mongoose')
const Schema =  mongoose.Schema;



const TableSchema = new Schema({
    name: String,
    is_active: Boolean,
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'table-type'
    },
    statusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'status'
    }
},{
    collection: 'billiard-table'
})

const TableModel = mongoose.model('billiard-table', TableSchema)


module.exports = TableModel;