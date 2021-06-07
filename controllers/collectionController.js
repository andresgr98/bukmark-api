'use strict'

const express = require('express')
const router = express.Router()

const collectionModel = require('../models/collectionModel')


/* ************************************************************************************************ */


router.route('/users/userID/collections')
  /* ---------------LISTAR COLECCIONES------------- */
  .get(async (req, res) => {
    try {
      const collectionList = await collectionModel.find().sort({ published_at: 'DESC' })
      res.json(collectionList)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------CREAR COLECCION--------------- */
  .post(async (req, res) => {
    try {
      let collectionName = req.body
      let collection = new collectionModel(collectionName).save()
      res.status(201).json(collection)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */

router.route('/users/userID/collections/collectionID')
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
  /* -----------------BORRAR COLECCIÓN */
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



router.route('/users/userID/collections/collectionID/OLID')
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
