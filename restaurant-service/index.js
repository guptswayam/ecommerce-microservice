const { default: axios } = require("axios");
const express = require("express");
const PORT = process.env.PORT_ONE || 9070;
const mongoose = require("mongoose");
const restrictTo = require("../common/restrictTo");
const isAuthenticated = require("./../common/isAuthenticated");
const Restaurant = require("./Restaurant");
const RestaurantProduct = require("./RestaurantProduct");

const app = express();

app.use(express.json())

mongoose.connect(
    "mongodb://localhost/ecommerce-restaurant-microservice",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Restaurant Service DB Connected`);
    }
);

async function getRestaurantOrThrowError(params) {
    const restaurant = await Restaurant.findOne(params)
    if(!restaurant)
        throw new Error()
    return restaurant
}

app.post("/restaurants", isAuthenticated, restrictTo("admin"), async (req, res) => {

    const restaurant = await Restaurant.create({...req.body, userId: req.user._id})

    res.json(restaurant)
})

app.post("/restaurants/addProducts", isAuthenticated, restrictTo("admin", "manager"), async (req, res) => {
    const {restaurantId, productIds = []} = req.body
    await getRestaurantOrThrowError({_id: restaurantId, userId: req.user._id})
    const products = (await axios.get("http://localhost:8070/products", {
        data: {productIds},
        headers: {
            "Authorization": req.headers.authorization
        }
    })).data

    let restaurantProducts = []
    for(const value of products)
        restaurantProducts.push({productId: value._id, restaurantId: restaurantId})
    
    if(restaurantProducts.length === 0) {
        return res.status(500).json("Invalid Product Id(s)!")
    }

    await RestaurantProduct.insertMany(restaurantProducts)

    res.send("success")

    
})

app.get("/restaurants", isAuthenticated, async (req, res) => {

    const restaurants = await Restaurant.find()

    res.json(restaurants)
})

app.get("/restaurants/products/:restaurantId", isAuthenticated, async (req, res) => {

    const restaurant = await getRestaurantOrThrowError({_id: req.params.restaurantId})

    const productIds = (await RestaurantProduct.find({restaurantId: restaurant._id}).select("productId")).map(el => el.productId)
    
    const products = (await axios.get("http://localhost:8070/products", {
        data: {productIds},
        headers: {
            "Authorization": req.headers.authorization
        }
    })).data

    res.json(products)
})

app.get("/restaurants/:restaurantId", isAuthenticated, async (req, res) => {
    const restaurant = await getRestaurantOrThrowError({_id: req.params.restaurantId})
    res.json(restaurant)
})

app.use((err, req, res, next) => {
    console.log(error)
    res.status(500).json(err.message)
})

app.listen(PORT, () => {
    console.log(`Restaurant-Service at ${PORT}`);
});
