const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    default:null
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: String,    // Token for resetting password (hashed)
  passwordResetExpires: Date, 
  
});



module.exports = mongoose.model("user", UserSchema);
