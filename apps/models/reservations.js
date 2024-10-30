const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const ReservationsSchema = new Schema({
   tableId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'billiard-table'
   },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    start_time: String,
    notes: String,
    status: String,
    reservation_date: Date
},{
    collection: 'reservations'
})


const ReservationsModel = mongoose.model('reservations',ReservationsSchema)

module.exports = ReservationsModel;