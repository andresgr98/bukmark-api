'use strict'

const mongoose = require('mongoose')

const readingSchema = require('./schemas/readingSchema')

const readingModel = mongoose.model('pages', readingSchema)

module.exports = readingModel
