const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const TableUsageSchema = new Schema({
   tableId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'billiard-table'
   },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    start_time: String,
    end_time: String,
    tableprice: String,
    total_duration: String,
    complete: Boolean,
    reservationId: String
},{
    collection: 'table-usage'
})


const TableUsageModel = mongoose.model('table-usage',TableUsageSchema)

module.exports = TableUsageModel;