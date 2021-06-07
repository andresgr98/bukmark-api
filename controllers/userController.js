'use strict'

const express = require('express')
const router = express.Router()
const sha512 = require('js-sha512')
const userModel = require('../models/userModel')


/* ************************************************************************************************ */


router.route('/users')
  /* ---------------------LISTAR USUARIOS-------------------- */
  .get(async (req, res) => {
    try {
      const limit = req.query.hasOwnProperty('limit') ? parseInt(req.query.limit) : 50
      let userList = await userModel.find().sort({ firstname: 'ASC', lastname: 'ASC' }).limit(limit).exec()
      userList = userList.map((user) => {
        user = user.toJSON()
        delete user.password
        return user
      })
      res.json(userList)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------------CREAR USUARIO------------------------- */
  .post(async (req, res) => {
    try {
      let userData = req.body
      userData.profile = "user"
      userData.password = sha512(userData.password)
      userData = await new userModel(userData).save()
      userData = userData.toJSON()
      delete userData.password
      res.status(201).json(userData)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */

router.route('/userID/users/userID')
  /* --------------------OBTENER 1 USUARIO---------------------- */
  .get(async (req, res) => {
    try{
      const userID = req.params.userID
      const founduser = await userModel.findById(userID).exec()
      if (!founduser) {
        res.status(404).json({ message: `Usuario con identificador ${userID} no encontrado.` })
        return
      }
      res.json(founduser)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -------------------- EDITAR NOMBRE DE LA COLECCION ------------------- */
  .put(async (req, res) => {
    try{
      const userID = req.params.userID
      const newName = req.body
      const updateduser = await userModel.findOneAndUpdate({_id: userID}, newName, { new: true }).exec()
      if (!updateduser) {
        res.status(404).json({ message: `Usuario con identificador ${userID} no encontrado.` })
        return
      }
      res.json(updateduser)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -----------------BORRAR COLECCIÓN ---------------------------------*/
  .delete(async (req, res) => {
    try{
      const userID = req.params.userID
      const deleteduser = await userModel.findOneAndDelete({_id: userID}).exec()
      if (!deleteduser) {
        res.status(404).json({ message: `Usuario con identificador ${userID} no encontrado.` })
        return
      }
      res.json(updateduser)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })



/* ************************************************************************************************ */



router.route('/userID/users/userID/OLID')
  /* ---------------------ELIMINAR UN LIBRO DE UNA COLECCION--------------------- */
  .delete(async (req, res) => {
    try{
      const userID = req.params.userID
      const olid = req.params.olid
      const founduser = await userModel.findById(userID).exec()
      if (!founduser) {
        res.status(404).json({ message: `Usuario con identificador ${userID} no encontrado.` })
        return
      }
      const foundBookIndex = founduser.books.findIndex((book) => book.olid === olid)
      founduser.books.splice(foundBookIndex, 1)
      res.status(204).json(null)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */


module.exports = router
