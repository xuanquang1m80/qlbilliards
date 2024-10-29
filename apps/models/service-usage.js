const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const ServiceUsageSchema = new Schema({
   serviceId:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'service'
   },
    table_usageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'table-usage'
    },
    quantity: String,
    totalprice: {
        type: mongoose.Types.Decimal128
    },
    create_at: String
},{
    collection: 'service-usage'
})


const ServiceUsageModel = mongoose.model('service-usage',ServiceUsageSchema)

module.exports = ServiceUsageModel;