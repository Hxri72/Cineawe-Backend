const mongoose = require('mongoose')
// const showSchema = new mongoose.Schema({
//     theatername:{
//         type:String,
//         required:true
//     },
//     showname:{
//         type:String,
//         required:true
//     },
//     moviename:{
//         type:String,
//         required:true
//     },
//     ticketprice:{
//         type:String,
//         required:true
//     },
//     startdate:{
//         type:String,
//         required:true
//     },
//     enddate:{
//         type:String,
//         required:true
//     },
//     showtime:{
//         type:String,
//         required:true
//     },
//     availableseats:{
//         type:String,
//         required:true
//     },
//     totalseats:{
//         type:String,
//         required:true
//     },
//     seats:[]
// })

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
    movielanguage:{
        type:String,
        required:true
    },
    ticketprice:{
        type:Number,
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
        type:Number,
        required:true
    },
    totalseats:{
        type:Number,
        required:true
    },
    dates:{
        type:Array,
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
        type:Number,
        required:true
    },
    totalRows:{
        type:Number,
        required:true
    },
    totalColumns:{
        type:Number,
        required:true
    },
    totalSeats:{
        type:Number,
        required:true
    },
    ownerEmail:{
        type:String,
        required:true
    },
    shows:[showSchema]
})

module.exports = mongoose.model('theater',theaterSchema)