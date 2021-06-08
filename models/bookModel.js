'use strict'

const mongoose = require('mongoose')

const bookSchema = require('./schemas/bookSchema')

const bookModel = mongoose.model('books', bookSchema)

module.exports = bookModel
