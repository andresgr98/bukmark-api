"use strict";

const express = require("express");
const router = express.Router();
const bookModel = require("../models/bookModel");
const authenticator = require('../modules/authenticator')
const onlyRegisteredAccess = authenticator(true, ['user', 'admin'])

/* ************************************************************************************************ */

router.route("/books")
  /* ---------------------LISTAR LIBROS-------------------- */
  .get(onlyRegisteredAccess, async (req, res) => {
    try {
      const limit = req.query.hasOwnProperty("limit")
        ? parseInt(req.query.limit)
        : 50;
      let bookList = await bookModel.find().sort({ title: "DESC" }).limit(limit).exec();
      res.json(bookList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  /* ---------------------CREAR LIBRO------------------------- */
  /* .post(async (req, res) => {
    try {
      let bookData = req.body;
      let bookExists = await bookModel.findOne({olid: bookData.olid}).exec()
      if (bookExists){
        res.status(409).json({message: "El libro ya está en la base de datos de Bukmark MongoDB"})
        return
      }
      let book = await new bookModel(bookData).save()
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }); */

/* ************************************************************************************************ */

module.exports = router;
