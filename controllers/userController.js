"use strict";

const express = require("express");
const router = express.Router();
const sha512 = require("js-sha512");
const collectionModel = require("../models/collectionModel");
const userModel = require("../models/userModel");

const authenticator = require('../modules/authenticator')
const onlyRegisteredAccess = authenticator(true, ['user', 'admin'])
const onlyUserAccess = authenticator(true, ['user'])
const onlyAdminAccess = authenticator(true, ['admin'])

/* ************************************************************************************************ */

router.route("/users")
  /* ---------------------LISTAR USUARIOS-------------------- */
  .get( async (req, res) => {
    try {
      const limit = req.query.hasOwnProperty("limit")
        ? parseInt(req.query.limit)
        : 50
      let userList = await userModel.find().sort({ firstname: "ASC", lastname: "ASC" }).limit(limit).exec()
      userList = userList.map((user) => {
        //duplicamos el array userList y le borramos la contraseña para no devolver nada sensible
        user = user.toJSON()
        delete user.email
        delete user.password
        return user
      });
      res.json(userList)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------------CREAR USUARIO------------------------- */
  .post(async (req, res) => {
    try {
      let userData = req.body;
      userData.profile = "user";
      userData.password = sha512(userData.password);
      userData.collections = []
      userData = await new userModel(userData).save();
      let readingCollection = {
        title: "Leyendo",
        user:  userData._id,
        books: [],
        is_removable: false
      }
      let readingListCollection = {
        title: "Lista de lectura",
        user:  userData._id,
        books: []
      }
      let collection = await new collectionModel(readingCollection).save()
      userData.collections.push({_id: collection._id})
      let collection2 = await new collectionModel(readingListCollection).save()
      userData.collections.push({_id: collection2._id})

      userData.save()
      userData = userData.toJSON();
      delete userData.password; //borramos la contraseña despues de haberse creado el usuario en la BD, asi que no se pierde y no se muestra al usuario
      res.status(201).json(userData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

/* ************************************************************************************************ */

router.route("/users/:userID")
  /* --------------------OBTENER 1 USUARIO---------------------- */
  .get(onlyRegisteredAccess, async (req, res) => {
    try {
      const userID = req.params.userID;
      /* Comprobamos que el usuario esta intentando acceder a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      let foundUser = await userModel.findById(userID).populate("collections._id").populate("reading._id").exec();
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

  router.route("/users/search/:nick")
  /* --------------------OBTENER USUARIO POR SU NICKNAME---------------------- */
  .get(onlyRegisteredAccess, async (req, res) => {
    try {
      const nick = req.params.nick;
      /* Comprobamos que el usuario esta intentando acceder a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      let foundUser = await userModel.findOne({nickname: nick}).populate("collections._id").populate("reading._id").exec();
      if (!foundUser) {
        res.status(404).json({
          message: `Usuario no encontrado.`,
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
  .put(onlyRegisteredAccess, async (req, res) => {
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
  .delete(onlyUserAccess, async (req, res) => {
    try {
      const userID = req.params.userID;
      /* Comprobamos que el usuario esta intentando editar a su propio perfil en caso de NO ser admin */
      /* if (userID !== req.tokenData._id && req.tokenData.profile === "user") {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      } */
      let foundUser = await userModel.findById(userID).populate("collections._id").exec()
      await collectionModel.deleteMany({user: userID}).exec()
      const deletedUser = await userModel.findOneAndDelete({ _id: userID }).exec()
      deletedUser.collections.map((col) => col._id)
      await collectionModel.deleteMany({"user" : userID})
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
