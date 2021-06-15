'use strict'

const express = require('express')
const database = require('./modules/database')
const bearerToken = require('express-bearer-token');

const cors = require('cors')
//middlewares con las rutas
const userController = require('./controllers/userController')
const collectionController = require('./controllers/collectionController')
const bookController = require('./controllers/bookController')
const authController = require('./controllers/authController')
const readingController = require('./controllers/readingController')

//server instance
const app = express()

app.use(bearerToken())
app.use(cors())


//middleware para parsear los cuerpos tipo application/JSON en el cuerpo
app.use(express.json())

//enganchamos los controladores de los diferentes recursos
app.use(userController)
app.use(collectionController)
app.use(bookController)
app.use(authController)
app.use(readingController)

database.connect()

module.exports = app
