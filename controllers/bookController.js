"use strict";

const express = require("express");
const router = express.Router();
const sha512 = require("js-sha512");
const collectionModel = require("../models/collectionModel");
const userModel = require("../models/userModel");
const bookModel = require("../models/bookModel");

/* ************************************************************************************************ */

router.route("/books")
  /* ---------------------LISTAR LIBROS-------------------- */
  .get(async (req, res) => {
    try {
      const limit = req.query.hasOwnProperty("limit")
        ? parseInt(req.query.limit)
        : 50;
      let bookList = await userModel.find().sort({ title: "DESC" }).limit(limit).exec();
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

router.route("/users/:userID")
  /* --------------------OBTENER 1 USUARIO---------------------- */
  .get(async (req, res) => {
    try {
      const userID = req.params.userID;
      /* Comprobamos que el usuario esta intentando acceder a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      let foundUser = await userModel.findById(userID).exec();
      if (!foundUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      foundUser = foundUser.toJSON();
      delete foundUser.password;
      res.json(foundUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  /* -------------------- EDITAR NOMBRE DEL USUARIO ------------------- */
  .put(async (req, res) => {
    try {
      const userID = req.params.userID;
      const userData = req.body;
      /* Comprobamos que el usuario esta intentando editar a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      let newUserData = {
        nickname: userData.nickname,
        firstname: userData.firstname,
        lastname: userData.lastname
      }
      let updatedUser = await userModel.findOneAndUpdate({ _id: userID }, newUserData, { new: true }).exec();
      if (!updatedUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      updatedUser = updatedUser.toJSON();
      delete updatedUser.password;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  /* -----------------BORRAR USUARIO ---------------------------------*/
  .delete(async (req, res) => {
    try {
      const userID = req.params.userID;
      /* Comprobamos que el usuario esta intentando editar a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      const deletedUser = await userModel.findOneAndDelete({ _id: userID }).exec();
      if (!deletedUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      res.status(204).json(null)
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


/* ************************************************************************************************ */


module.exports = router;
