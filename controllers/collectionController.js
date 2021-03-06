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
  /* ---------------LISTAR COLECCIONES DEL USUARIO------------- */
  .get(onlyRegisteredAccess, async (req, res) => {
    try {
      let token = req.tokenData
      let userID = token._id
      let foundUser = await userModel.findById(userID).populate("collections._id").exec()
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
        res.status(404).json({ message: `Colecci??n con identificador ${collectionID} no encontrada.` })
        return
      }
      res.json(foundCollection)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* ---------------------A??ADIR 1 LIBRO A UNA COLECCION-------------------- */
  .post (onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const foundCollection = await collectionModel.findById(collectionID).exec()
      const newBook = req.body
      /* Comprobamos si el libro existe en nuestra base de datos de MongoDB y si es asi solo lo metemos en la coleccion */
      let bookExists = await bookModel.findOne({olid: newBook.olid}).exec()
      if (bookExists){
        console.warn( "El libro ya est?? en la base de datos de Bukmark MongoDB")
        console.log(bookExists.olid)
        let fullCollection = await collectionModel.findById(collectionID).populate("books._id").exec()
        let existsInCollection = fullCollection.books.find((book) => book._id.olid === bookExists.olid)
        console.log("fullcollection: ", fullCollection)
        if(existsInCollection){
          res.status(409).json({message: "El libro ya est?? en la colecci??n. Int??ntalo con otro libro."})
          return
        }
        foundCollection.books.push(bookExists._id )
        foundCollection.save()
        res.status(201).json("Libro a??adido a la colecci??n.")
        return
      }
      /* Si la ejecuci??n llega aqu??, es que no existe el libro en la BD. Entonces lo creamos y lo guardamos */
      let book = await new bookModel(newBook).save()
      if (!foundCollection) {
        res.status(404).json({ message: `Colecci??n con identificador ${collectionID} no encontrada.` })
        return
      }
      foundCollection.books.push(book._id)
      foundCollection.save()
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -------------------- EDITAR VISIBILIDAD DE LA COLECCION ------------------- */
  .put(onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const visibility = req.body
      let foundCollection = await collectionModel.findById(collectionID).exec()
      let updatedItem = await collectionModel.findOneAndUpdate({_id: collectionID}, visibility, {new: true}).exec()
      if(!updatedItem){
        res.status(401).json({message: "Coleccion no encontrada"})
      }
      await foundCollection.save()
      res.json(updatedItem)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })
  /* -----------------BORRAR COLECCI??N------------------------------*/
  .delete(onlyUserAccess, async (req, res) => {
    try{
      const userID = req.tokenData._id
      const collectionID = req.params.collectionID
      let user = await userModel.findById(userID).exec()
      const userCollectionIndex = user.collections.findIndex((col) => col._id == collectionID)
      if (userCollectionIndex === -1){
        res.status(404).json({message: "No existe esa colecci??n en este usuario."})
        return
      }
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (foundCollection.is_removable === false) {
        res.status(401).json({message: "No puedes editar esta colecci??n"})
        return
      }
      const deletedCollection = await collectionModel.findOne({_id: collectionID}).exec()
      if (!deletedCollection) {
        res.status(404).json({ message: `Colecci??n con identificador ${collectionID} no encontrada.` })
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



router.route('/collections/:collectionID/books/:bookID')
  /* ----------------ELIMINAR UN LIBRO DE UNA COLECCION--------------------- */
  .delete(onlyRegisteredAccess, async (req, res) => {
    try{
      const collectionID = req.params.collectionID
      const bookID = req.params.bookID
      console.log(bookID)
      const foundCollection = await collectionModel.findById(collectionID).exec()
      if (!foundCollection) {
        res.status(404).json({ message: `Colecci??n con identificador ${collectionID} no encontrada.` })
        return
      }
      console.log(foundCollection)
      const foundBookIndex = foundCollection.books.findIndex((book) => book._id == bookID)
      if(foundBookIndex === -1) {
        res.status(404).json({ message: `Libro no encontrado.` })
        return
      }
      foundCollection.books.splice(foundBookIndex, 1)
      foundCollection.save()
      console.log("Libro eliminado de la colecci??n")
      res.status(204).json(null)
    }catch(error){
      res.status(500).json({ message: error.message })
    }
  })


/* ************************************************************************************************ */
router.route('/reading')
/* ----------------ACCEDER A LA LISTA DE LECTURA DEL USUARIO -------------- */
.get(onlyRegisteredAccess, async (req, res) => {
  try{
    const userID = req.tokenData._id
    let readingCollection = await collectionModel.findOne({user: userID, is_removable: false}).populate('books._id').exec()
    if(!readingCollection){
      res.status(404).json({message: "Colecci??n de leyendo no encontrada"})
    }
    res.json(readingCollection)
  }catch(error){
    res.status(500).json({ message: error.message })
  }
})


/* ************************************************************** */

router.route('/users/search/:nick/collections')
/* -------------MOSTRAR COLECCIONES PUBLICAS DE UN USUARIO ------------- */
.get(onlyRegisteredAccess, async(req, res) => {
  try {
    let nick = req.params.nick
    let foundUser = await userModel.findOne({nickname: nick}).populate("collections._id").exec()
    if (!foundUser) {
      res.status(404).json({
        message: `Usuario con identificador ${userID} no encontrado.`,
      });
      return;
    }
    const collectionList = foundUser.collections.filter((item) => item._id.visibility === "public")
    res.json(collectionList)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})
 router.route('/users/search/:nick/collections/:collectionID')
 .get(onlyRegisteredAccess, async(req, res) => {
  try{
    const collectionID = req.params.collectionID
    const foundCollection = await collectionModel.findById(collectionID).populate("books._id").exec()
    if (!foundCollection) {
      res.status(404).json({ message: `Colecci??n con identificador ${collectionID} no encontrada.` })
      return
    }
    res.json(foundCollection)
  }catch(error){
    res.status(500).json({ message: error.message })
  }
})
module.exports = router
