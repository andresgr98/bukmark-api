const { Schema } = require("mongoose")


const collectionSchema = new Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 80 },
  user: {type: Schema.Types.ObjectId, ref: 'users'},
  books: [
    {
      _id: {type: Schema.Types.ObjectId, ref: 'books'},
    }
  ],
  is_removable: { type: Boolean, default: true },
  published_at: {type: Date, default: Date.now},
  visibility: { type: String, enum: ["public", "private"], default: "private" }
})

module.exports = collectionSchema
