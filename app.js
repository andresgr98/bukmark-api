'use strict'

const express = require('express')
const database = require('./modules/database')

//middlewares con las rutas
const userController = require('./controllers/userController')
const collectionController = require('./controllers/collectionController')


//server instance
const app = express()

/* app.use(bearerToken())
app.use(cors()) */


//middleware para parsear los cuerpos tipo application/JSON en el cuerpo
app.use(express.json())

//enganchamos los controladores de los diferentes recursos
app.use(userController)
app.use(collectionController)

database.connect()

module.exports = app
