require('dotenv').config({path:'.env'})
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/adminRoutes')
const installationOrderRoutes = require('./routes/installationOrderRoutes')
const mssqlRoutes = require('./routes/mssqlRoutes')
const checkListRoutes = require('./routes/checkListRoutes')
const { errorHandler } = require('./middlewares/errorHandler')

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

app.use(adminRoutes)
app.use(installationOrderRoutes)
app.use(mssqlRoutes)
app.use(checkListRoutes)

app.use(errorHandler)

//MongoDB connection
const mongoUri = process.env.MONGO_URI2
mongoose.connect(mongoUri)
mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB instance!")
})

app.use('*', ( req, res ) => {
    res.status(404)
    console.log(req.method+': '+req.baseUrl)
    throw new Error('Resource not found.')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, ()=>{
    console.log(`App server is running on port ${PORT}!`)
})