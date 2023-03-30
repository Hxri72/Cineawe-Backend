const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
    theatername:{
        type:String,
        ref: 'Theater',
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
    startdate:{
        type:String,
        required:true
    },
    enddate:{
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
    },
    seats:[]
})

export default show = module.exports = mongoose.model('shows',showSchema)