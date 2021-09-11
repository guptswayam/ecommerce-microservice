const express = require("express");
const PORT = process.env.PORT_ONE || 8070;
const mongoose = require("mongoose");
const restrictTo = require("../common/restrictTo");
const isAuthenticated = require("./../common/isAuthenticated");
const Product = require("./Product");


const app = express();

app.use(express.json())

mongoose.connect(
    "mongodb://localhost/ecommerce-product-microservice",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Product Service DB Connected`);
    }
);

app.post("/products", isAuthenticated, restrictTo("admin", "manager"), async (req, res) => {
    const { name, description, price, category } = req.body;
    const newProduct = new Product({
        name,
        description,
        price,
        category
    });
    await newProduct.save()
    return res.json(newProduct);
})

app.get("/products", isAuthenticated, async (req, res) => {
    const {productIds} = req.body;

    let queryObj = {}

    if(productIds)
        queryObj["_id"] = {$in: productIds}

    console.log(queryObj)
    const products = await Product.find(queryObj)

    res.json(products)

})


app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});
