const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/userAuth");

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    phonenum : Number,
    email: String,
    password: String
});

module.exports = mongoose.model("user", userSchema);