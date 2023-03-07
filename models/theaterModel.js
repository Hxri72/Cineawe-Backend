const mongoose = require('mongoose')

const theaterSchema = new mongoose.Schema({
    theaterName:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    totalSeats:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('theater',theaterSchema)