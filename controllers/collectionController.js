'use strict'

const express = require('express')
const router = express.Router()

const collectionModel = require('../models/collectionModel')
const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')

const authenticator = require('../modules/authenticator')
const onlyRegisteredAccess = authenticator(true, ['user', 'admin'])
const onlyUserAccess = authenticator(true, ['user'])
const onlyAdminAccess = authenticator(true, ['admin'])

/* ************************************************************************************************ */


router.route('/collections')
  /* ---------------LISTAR COLECCIONES DE UN USUARIO------------- */
  .get(onlyRegisteredAccess, async (req, res) => {
    try {
      let token = req.tokenData
      let userID = token._id
      let foundUser = await userModel.findById(userID).populate("collections._id").exec()
      foundUser.populate("collections._id.books._id").exec()
      if (!foundUser) {
        res.status(404).json({
          message: `Usuario con identificador ${userID} no encontrado.`,
        });
        return;
      }
      const collectionList = foundUser.collections
      res.json(collectionList)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------CREAR COLECCION--------------- */
  .post(onlyRegisteredAccess, async (req, res) => {
    try {
      let token = req.tokenData
      let userID = token._id
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
      let collection = await new collectionModel(newCollectionData).save()
      foundUser.collections.push({_id: collection._id})
      foundUser.save()
      res.status(201).json(collection)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */

router.route('/collections/:collectionID')
  /* --------------------OBTENER 1 COLECCION--------------- */
  .get( async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const foundCollection = await collectionModel.findById(collectionID).populate("books._id").exec()
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
  .post (onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const foundCollection = await collectionModel.findById(collectionID).exec()
      const newBook = req.body
      /* Comprobamos si el libro existe en nuestra base de datos de MongoDB y si es asi solo lo metemos en la coleccion */
      let bookExists = await bookModel.findOne({olid: newBook.olid}).exec()
      if (bookExists){
        console.warn( "El libro ya está en la base de datos de Bukmark MongoDB")
        console.log(bookExists.olid)
        let fullCollection = await collectionModel.findById(collectionID).populate("books._id").exec()
        let existsInCollection = fullCollection.books.find((book) => book._id.olid === bookExists.olid)
        console.log("fullcollection: ", fullCollection)
        if(existsInCollection){
          res.status(409).json({message: "El libro ya está en la colección. Inténtalo con otro libro."})
          return
        }
        foundCollection.books.push(bookExists._id )
        foundCollection.save()
        res.status(201).json("Libro añadido a la colección.")
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
  .put(onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const newName = req.body
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (foundCollection.is_removable === false) {
        res.status(401).json({message: "No puedes editar esta colección"})
        return
      }
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
  .delete(onlyUserAccess, async (req, res) => {
    try{
      const userID = req.tokenData._id
      const collectionID = req.params.collectionID
      let user = await userModel.findById(userID).exec()
      const userCollectionIndex = user.collections.findIndex((col) => col._id == collectionID)
      if (userCollectionIndex === -1){
        res.status(404).json({message: "No existe esa colección en este usuario."})
        return
      }
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (foundCollection.is_removable === false) {
        res.status(401).json({message: "No puedes editar esta colección"})
        return
      }
      const deletedCollection = await collectionModel.findOne({_id: collectionID}).exec()
      if (!deletedCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      user.collections.splice(userCollectionIndex, 1)
      await collectionModel.findOneAndDelete({_id: collectionID}).exec()
      user.save()
      res.status(204).json({})
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })



/* ************************************************************************************************ */



router.route('/collections/:collectionID/books/:OLID')
  /* ----------------ELIMINAR UN LIBRO DE UNA COLECCION--------------------- */
  .delete(onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const olid = req.params.OLID
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (!foundCollection) {
        res.status(404).json({ message: `Colección con identificador ${collectionID} no encontrada.` })
        return
      }
      const foundBookIndex = foundCollection.books.findIndex((book) => book.olid === olid)
      foundCollection.books.splice(foundBookIndex, 1)
      foundCollection.save()
      console.log("Libro eliminado de la colección")
      res.status(204).json(null)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */
router.route('/reading')
.get(onlyRegisteredAccess, async (req, res) => {
  try{
    const userID = req.tokenData._id
    let readingCollection = await collectionModel.findOne({user: userID, is_removable: false}).populate('books._id').exec()
    if(!readingCollection){
      res.status(404).json({message: "Colección de leyendo no encontrada"})
    }
    res.json(readingCollection)
  }catch(error){
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
