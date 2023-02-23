const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
    try {   
        const token = req.body.jwtToken
        const decoded = jwt.verify(token, process.env.jwt_secret);
        req.body.userId = decoded._id
        next();
    } catch (error) {
        console.log(error.message)
        res.send({
            message: 'Invalid Token'
        })
    }
}