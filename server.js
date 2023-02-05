const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())

const dbConfig = require("./config/dbConfig")
const userRoute = require("./routes/userRoute")


app.use('/api/users',userRoute)


const port = process.env.PORT || 5000
app.listen(port,()=> console.log(`server is running on port ${port}`))