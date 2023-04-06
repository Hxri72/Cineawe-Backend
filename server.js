const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(
    cors({
      // origin: ["http://localhost:3000"],
    origin: ["https://cineawe.online"],
      methods: ["GET", "POST", "PUT", "DELETE","HEAD", "OPTIONS"],
      credentials: true,  
      exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  
    })
  );

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