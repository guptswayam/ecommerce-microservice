const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["user", "admin", "Manager"],
        default: "user"
    }
});

UserSchema.set("timestamps", true)

module.exports = User = mongoose.model("users", UserSchema);