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