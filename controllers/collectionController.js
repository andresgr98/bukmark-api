'use strict'

const express = require('express')
const router = express.Router()

const collectionModel = require('../models/collectionModel')
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')

/* ************************************************************************************************ */


router.route('/users/:userID/collections')
  /* ---------------LISTAR COLECCIONES DE UN USUARIO------------- */
  .get(async (req, res) => {
    try {
      const userID = req.params.userID
      let foundUser = await userModel.findById(userID).populate("collections").exec()
      if (!foundUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      const collectionList = foundUser.collections
      console.log(foundUser)
      res.json(collectionList)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------CREAR COLECCION--------------- */
  .post(async (req, res) => {
    try {
      const userID = req.params.userID
      let foundUser = await userModel.findById(userID).exec()
      if (!foundUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      let newCollectionData = {
        title: req.body.title,
        books: [],
        user: {_id: userID}
      }
      let collection = new collectionModel(newCollectionData).save()
      foundUser.collections.push({_id: collection._id})
      foundUser.save()
      res.status(201).json(collection)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */

router.route('/users/:userID/collections/:collectionID')
  /* --------------------OBTENER 1 COLECCION--------------- */
  .get(async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (!foundCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      res.json(foundCollection)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------------AÑADIR 1 LIBRO A UNA COLECCION-------------------- */
  .post (async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const foundCollection = await collectionModel.findById(collectionID).exec()
      const newBook = req.body
      let bookExists = await bookModel.findOne({olid: newBook.olid}).exec()
      /* Comprobamos si el libro existe en nuestra base de datos de MongoDB y si es asi solo lo metemos en la coleccion */
      if (bookExists){
        res.status(409).json({message: "El libro ya está en la base de datos de Bukmark MongoDB"})
        foundCollection.books.push(bookExists._id )
        foundCollection.save()
        return
      }
      /* Si la ejecución llega aquí, es que no existe el libro en la BD. Entonces lo creamos y lo guardamos */
      let book = await new bookModel(newBook).save()
      if (!foundCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      foundCollection.books.push(book._id)
      foundCollection.save()
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -------------------- EDITAR NOMBRE DE LA COLECCION ------------------- */
  .put(async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const newName = req.body
      const updatedCollection = await collectionModel.findOneAndUpdate({_id: collectionID}, newName, { new: true }).exec()
      if (!updatedCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      res.json(updatedCollection)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -----------------BORRAR COLECCIÓN------------------------------*/
  .delete(async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const deletedCollection = await collectionModel.findOneAndDelete({_id: collectionID}).exec()
      if (!deletedCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      res.json(updatedCollection)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })



/* ************************************************************************************************ */



router.route('/users/:userID/collections/:collectionID/:OLID')
  /* ----------------ELIMINAR UN LIBRO DE UNA COLECCION--------------------- */
  .delete(async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const olid = req.params.olid
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (!foundCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      const foundBookIndex = foundCollection.books.findIndex((book) => book.olid === olid)
      foundCollection.books.splice(foundBookIndex, 1)
      res.status(204).json(null)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */


module.exports = router
