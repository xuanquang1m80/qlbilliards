const mongoose = require('mongoose')
const Schema =  mongoose.Schema;

const AccountSchema = new Schema({
    name: String,
    username: String,
    password: String,
    phone: String
},{
    collection: 'accounts'
})

const AccountModel = mongoose.model('accounts', AccountSchema)


module.exports = AccountModel;