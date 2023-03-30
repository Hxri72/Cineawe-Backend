const mongoose = require('mongoose')

const seatSchema = new mongoose.Schema({
    id : {
        type:String,
        required:true
    },
})

const bookingSchema = new mongoose.Schema({
    user : {
        type:String,
        required:true
    },
    userMail : {
        type:String,
        required:true
    },
    contactMail : {
        type:String,
        required:true
    },
    contactPhone : {
        type:String,
        required:true
    },
    theaterName : {
        type:String,
        required:true
    },
    movieName : {
        type:String,
        required:true
    },
    showDate:{
        type:String,
        required:true
    },
    showTime:{
        type:String,
        required:true
    },
    subTotal:{
        type:String,
        required:true
    },
    totalPrice:{
        type:String,
        required:true
    },
    selectedSeats:[seatSchema],
})

module.exports = mongoose.model('bookings',bookingSchema)