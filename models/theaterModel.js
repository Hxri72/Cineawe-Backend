const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
    theatername:{
        type:String,
        required:true
    },
    showname:{
        type:String,
        required:true
    },
    moviename:{
        type:String,
        required:true
    },
    ticketprice:{
        type:String,
        required:true
    },
    showdate:{
        type:String,
        required:true
    },
    showtime:{
        type:String,
        required:true
    },
    availableseats:{
        type:String,
        required:true
    },
    totalseats:{
        type:String,
        required:true
    }
})

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
    },
    shows:[showSchema]
})

module.exports = mongoose.model('theater',theaterSchema)