module.exports = function (...roles) {
    return (req, res, next) => {
        if(roles.includes(req.user.role)){
            next()
        }
        else
            return res.status(403).send("Forbidden!")
    }
}