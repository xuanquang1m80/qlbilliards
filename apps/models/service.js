const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const ServiceSchema = new Schema({
    name: String,
    price: {
        type: mongoose.Types.Decimal128
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'service-type'
    },
    is_active: Boolean
},{
    collection: 'service'
})


const ServiceModel = mongoose.model('service',ServiceSchema)

module.exports = ServiceModel;