'use strict'

const express = require('express')
const database = require('./modules/database')

//middlewares con las rutas
//const indexController = require('./controllers/IndexController')


//server instance
const app = express()

/* app.use(bearerToken())
app.use(cors()) */


//middleware para parsear los cuerpos tipo application/JSON en el cuerpo
app.use(express.json())

//enganchamos los controladores de los diferentes recursos
//app.use(indexController)

database.connect()

module.exports = app
