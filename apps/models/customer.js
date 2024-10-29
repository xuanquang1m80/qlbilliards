const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const CustomerSchema = new Schema({
    name: String,
    address: String,
    phone: String,
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'customer-type'
    },
    is_active: Boolean
},{
    collection: 'customer'
})


const CustomerModel = mongoose.model('customer',CustomerSchema)

module.exports = CustomerModel;