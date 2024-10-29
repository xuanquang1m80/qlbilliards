const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const InvoicesSchema = new Schema({
   table_usageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'table-usage'
   },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    payment_method: String,
    total_amount: String,
    status: String,
    update_at: String
},{
    collection: 'invoices'
})


const InvoicesModel = mongoose.model('invoices',InvoicesSchema)

module.exports = InvoicesModel;