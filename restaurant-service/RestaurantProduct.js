const mongoose = require("mongoose")

const restaurantProductsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "restaurants"
    },

})

restaurantProductsSchema.index({restaurantId: 1, productId: 1}, {unique: true})

restaurantProductsSchema.set("timestamps", true)

const RestaurantProduct = mongoose.model("restaurant_products", restaurantProductsSchema)

module.exports = RestaurantProduct

// https://stackoverflow.com/questions/58517773/how-to-manage-many-to-many-relations-in-microservices-architecture