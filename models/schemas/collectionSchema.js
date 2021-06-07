const { Schema } = require("mongoose")


const collectionSchema = new Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 80 },
  user: {
    //SIN IMPLEMENTAR
    _id: {type: String, required: true, minlength: 3, maxlength: 200},

  },
  books: [
    {
      olid: { type: String, minlength: 3, maxlength: 255 },
      title: { type: String, minlength: 3, maxlength: 255 },
      author: { type: String, minlength: 3, maxlength: 255 },
      synopsis: { type: String, minlength: 3, maxlength: 255 },
      number_of_pages: { type: Number, minlength: 1 },
      isbn: { type: String, minlength: 3, maxlength: 255 },
      cover: { type: String, minlength: 3, maxlength: 255 },
      category: { type: String, minlength: 3, maxlength: 255 },
      author: { type: String, minlength: 3, maxlength: 255 },
      published_date: {type: Date, minlength: 3},
      url: { type: String, minlength: 3, maxlength: 255 }
    }
  ],
  published_at: {type: Date, default: Date.now},
  visibility: { type: String, enum: ["public", "private"], default: "private" }
})

module.exports = collectionSchema
