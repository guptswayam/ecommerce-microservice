const axios = require("axios")

module.exports = async function isAuthenticated(req, res, next) {
    try {
        // console.log(req.headers.authorization)
        const res = await axios.default.get("http://localhost:7070/users/isAuthenticated", {
            headers: {
                "Authorization": req.headers.authorization
            }
        })
        req.user = res.data;
        next()
    } catch (error) {
        return res.status(401).json("Unauthorized!")
    }
};