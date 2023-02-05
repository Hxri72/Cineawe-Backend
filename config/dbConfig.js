const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL)

const connection = mongoose.connection

connection.on('connected',()=> {console.log('DB is connected')})

connection.on('error',()=>{console.log('DB connection failed')})