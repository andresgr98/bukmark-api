const { Schema } = require("mongoose")

let bookSchema = new Schema({
  olid: { type: String, minlength: 3 },
  title: { type: String, minlength: 3, maxlength: 255 },
  author: { type: String, minlength: 3, maxlength: 255 },
  isbn: { type: String, minlength: 3, maxlength: 255 },
  cover : { type: String, minlength: 3, maxlength: 255 },
  publisher: { type: String, minlength: 3, maxlength: 255 },
  published_at: { type: String, minlength: 3, maxlength: 255 },
  url: { type: String, minlength: 3, maxlength: 255 },
  current_page: { type: Number, minlength: 1, default: 0 },
  number_of_pages:  { type: Number, minlength: 1, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = bookSchema
