const mongoose = require('mongoose')

const MovieSchema = new mongoose.Schema({
    englishMovies : {
        type:Array,
        required:true
    },
    malayalamMovies : {
        type:Array,
        required:true
    },
    tamilMovies : {
        type : Array,
        required:true
    }
})

module.exports = mongoose.model('movies',MovieSchema)