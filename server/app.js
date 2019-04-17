const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express()

const routes = require('./routes')
const {error} = require('./middleware')



app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// Cors
app.use((req,res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requsted-With, Content-Type, Accpet, Authorization"
    )
    if(req.method === "OPTIONS"){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE')
        return res.status(200).json({})
    }
    next()
})

app.get('/', (req,res,next) => {
    res.status(200).json({
        message:{
            version_api:process.env.API_VERSION
        }
    })

})

// Routes

app.use('/gmail', routes.gmail)
app.use('/ms', routes.ms)



// Errors
app.use(error.throwError)
app.use(error.sendError)



module.exports = app