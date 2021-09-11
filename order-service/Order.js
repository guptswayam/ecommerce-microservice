const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    productIds: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        default: undefined
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true
    },
    
    orderStatus: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

    paymentType: {
        type: String,
        enum: ["online", "offline"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "success", "fail"],
    },

    deliveryStatus: {
        type: String,
        enum: ["Cooking", "Out For Delivery", "Delivered"]
    },



})

orderSchema.set("timestamps", true)

orderSchema.pre("save", function(next) {
    this.paymentStatus = this.paymentType === "online" ? "pending" : "success"
    next()
})

const Order = mongoose.model("orders", orderSchema)

module.exports = Order