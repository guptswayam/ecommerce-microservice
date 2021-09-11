const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({

    price: {
        type: Number,
        required: true
    },

    name: {
        required: true,
        type: String
    },

    category: {
        type: String,
        required: true
    },

    description: String

})

productSchema.set("timestamps", true)

const Product = mongoose.model("products", productSchema)

module.exports = Product