'use strict'

const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('../modules/config')

const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const readingModel = require('../models/readingModel')
router.route('/pages')
.post(async (req, res) => {
  try{
    const body = req.body
    const numberOfPages = {number_of_pages: body.number_of_pages}
    let pages = await new readingModel(numberOfPages).save()
    const book = await bookModel.findById(body.book).exec()
    pages.book.push(book)
    pages = await pages.save()
    const user = await userModel.findById(body.user).exec()
    user.pages.push(pages)
    await user.save()
  }catch(error){
    res.status(500).json({message: "Error interno"})
  }

})
module.exports = router
