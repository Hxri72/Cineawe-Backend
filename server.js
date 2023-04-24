const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
// app.use(cors())

//database connection
require("./config/dbConfig")

const userRoute = require("./routes/User/userRoute")
const adminRoute = require("./routes/Admin/adminRoute")
const ownerRoute = require('./routes/owner/ownerRoute')

app.use('/api/users',userRoute)
app.use('/api/admin',adminRoute)
app.use('/api/owner',ownerRoute)

const port = process.env.PORT || 5000
app.listen(port,()=> console.log(`server is running on port ${port}`))

app.use(cors({
    origin : "https://cineawe.online",
    methods : ["GET","POST","PUT","DELETE"],
    credentials : true,
    allowedHeaders : ['X-Requested-With,content-type']
}));

// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     // Pass to next layer of middleware
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
  
//     next();
// });