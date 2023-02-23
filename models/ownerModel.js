const mongoose = require('mongoose')

const ownerSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdminApprove:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('owner',ownerSchema)