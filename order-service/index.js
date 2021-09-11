const { default: axios } = require("axios");
const express = require("express");
const PORT = process.env.PORT_ONE || 10070;
const mongoose = require("mongoose");
const restrictTo = require("../common/restrictTo");
const isAuthenticated = require("./../common/isAuthenticated");
const Order = require("./Order");
const amqp = require("amqplib")


const app = express();

app.use(express.json())


mongoose.connect(
    "mongodb://localhost/ecommerce-order-microservice",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Order Service DB Connected`);
    }
);



let channel;

async function connect() {
    const connection = await amqp.connect("amqp://localhost")
    channel = await connection.createChannel()        
    await channel.assertQueue("PAYMENT_SUCCESS")

    channel.consume("PAYMENT_SUCCESS", async (msg) => {
        const data = JSON.parse(msg.content.toString())
        console.log(data)
        if(data && data.orderId) {
            await Order.updateOne({_id: data.orderId}, {orderStatus: "accepted", paymentStatus: "success"})
            channel.ack(msg)
        }
    })

}

connect().then(() => {console.log("Connected to RabbitMQ!")}).catch((err) => {console.log(err); process.exit(1)})


function getHeaders(req){
    return {
        "Authorization": req.headers.authorization
    }
}


app.post("/orders", isAuthenticated, async (req, res) => {
    const {restaurantId, productIds = [], paymentType, address} = req.body;

    const restaurant = (await axios.get(`http://localhost:9070/restaurants/${restaurantId}`, {
        headers: getHeaders(req)
    })).data

    console.log(restaurant)

    const products = (await axios.get("http://localhost:8070/products", {
        headers: getHeaders(req),
        data: {productIds}
    })).data

    const price = products.reduce((prev, curr) => {
        return prev + curr.price;
    }, 0)


    const order = await Order.create({
        amount: price,
        restaurantId,
        productIds: products.map(el => el._id),
        userId: req.user._id,
        paymentType,
        address: req.body.address,
        orderStatus: paymentType === "online"? "pending": "accepted"
    })

    res.json(order)

})

app.get('/orders', isAuthenticated, restrictTo("admin"), async (req, res) => {
    const orders = await Order.find()

    res.json(orders)
})

async function getOrderOrThrowError(params = {}) {
    const order = await Order.findOne(params)
    if(!order)
        throw new Error()
    return order
}

app.get("/orders/:orderId", isAuthenticated, async (req, res) => {
    const order = await getOrderOrThrowError({_id: req.params.orderId, userId: req.user._id})
    res.json(order)
})

app.listen(PORT, () => {
    console.log(`Order-Service at ${PORT}`);
});
