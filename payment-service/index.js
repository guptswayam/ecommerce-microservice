const express = require("express");
const PORT = process.env.PORT_ONE || 11070;
const restrictTo = require("../common/restrictTo");
const isAuthenticated = require("./../common/isAuthenticated");
const amqp = require("amqplib");
const { default: axios } = require("axios");

const app = express();

app.use(express.json())

let channel;

async function connect() {
    const connection = await amqp.connect("amqp://localhost")
    channel = await connection.createChannel()        
    await channel.assertQueue("PAYMENT_SUCCESS")
}

connect().then(() => {console.log("Connected to RabbitMQ!")}).catch((err) => {console.log(err); process.exit(1)})


function getHeaders(req){
    return {
        "Authorization": req.headers.authorization
    }
}


/* 
The reason why we using rabbitMQ here because Once the payment is made the API should return success.
If we made a synchronous request to update the orderStatus then it may be fail, and then our madePayment will also fail.
If we return the success response from madePayment api even if update orderStatus api fail, then we would never update the orderStatus
The only possible solution here is MQs, because they wait until the microservice become available to consume the messages.
*/
app.post("/payments/madePayment/:orderId", isAuthenticated, async (req, res) => {
    const order = await axios.get("http://localhost:10070/orders/" + req.params.orderId, {
        headers: getHeaders(req)
    })
    // Code for process the payment
    channel.sendToQueue("PAYMENT_SUCCESS", Buffer.from(JSON.stringify({orderId: req.params.orderId})))
    res.status(200).send("Success")
})


app.listen(PORT, () => {
    console.log(`Payment-Service at ${PORT}`);
});
