const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const TypeSchema = new Schema({
    name: String,
    price: {
        type:mongoose.Types.Decimal128
    }
},{
    collection: 'table-type'
});

const TypeTable = mongoose.model('table-type', TypeSchema)

module.exports= TypeTable;