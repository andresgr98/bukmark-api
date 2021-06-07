const { Schema } = require("mongoose")

let userSchema = new Schema({
  nickname: { type: String, required: true, minlength: 3, maxlength: 100 },
  firstname: { type: String, required: true, minlength: 3, maxlength: 100 },
  lastname: { type: String, required: true, minlength: 3, maxlength: 100 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, maxlength: 200 },
  profile: { type: String, required: false, enum: ["admin", "user"], default: 'user' },
  reading: [
    {
      olid: { type: String, minlength: 3 },
      title: { type: String, minlength: 3, maxlength: 255 },
      author: { type: String, minlength: 3, maxlength: 255 },
      isbn: { type: String, minlength: 3, maxlength: 255 },
      cover : { type: String, minlength: 3, maxlength: 255 },
      publisher: { type: String, minlength: 3, maxlength: 255 },
      published_at: { type: String, minlength: 3, maxlength: 255 },
      url: { type: String, minlength: 3, maxlength: 255 },
      current_page: { type: Number, minlength: 1, default: 0 },
      number_of_pages:  { type: Number, minlength: 1, default: 0 }
    }
  ],
  created_at: { type: Date, default: Date.now }
});

module.exports = userSchema
