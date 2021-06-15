const { Schema } = require("mongoose")


const readingSchema = new Schema({
  book: [
    {
      type: Schema.Types.ObjectId, ref: 'books'
    }
  ],
  number_of_pages: { type: Number},
  current_page: { type: Number, default: 0},
})

module.exports = readingSchema
