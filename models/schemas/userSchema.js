const { Schema } = require("mongoose")

let userSchema = new Schema({
  nickname: { type: String, required: true, minlength: 3, maxlength: 100 },
  firstname: { type: String, required: true, minlength: 3, maxlength: 100 },
  lastname: { type: String, required: true, minlength: 3, maxlength: 100 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6, maxlength: 200 },
  profile: { type: String, required: false, enum: ["admin", "user"], default: 'user' },
  pages: [
    {
      type: Schema.Types.ObjectId, ref: 'pages'
    }
  ],
  collections: [
    {
      _id: {type: Schema.Types.ObjectId, ref: 'collections'}
    }
  ],
  created_at: { type: Date, default: Date.now }
});

module.exports = userSchema
