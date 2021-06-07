'use strict'

const mongoose = require('mongoose')

const collectionSchema = require('./schemas/collectionSchema')

const collectionModel = mongoose.model('collections', collectionSchema)

module.exports = collectionModel
