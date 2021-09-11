const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose");
const User = require("./User");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("./../common/isAuthenticated")

mongoose.connect(
    "mongodb://localhost/ecommerce-user-microservice",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Auth-Service DB Connected`);
    }
);

app.use(express.json());

app.post("/users/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            _id: user._id,
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
});

app.post("/users/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            email,
            name,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
});

app.get("/users/isAuthenticated", async (req, res) => {
    const token = req.headers["authorization"].split(" ")[1];

    jwt.verify(token, "secret", async (err, payload) => {
        if (err) {
            return res.status(401).json({ message: err });
        } else {
            const user = await User.findById(payload._id)
            // other authorization logic
            if(!user)
                return res.status(401).json({message: "Invalid Id!"})
            res.json(user)
        }
    });
    
})

app.get("/users/me", isAuthenticated, async (req, res) => {
    res.json(req.user)
})

app.listen(PORT, () => {
    console.log(`Auth-Service at ${PORT}`);
});