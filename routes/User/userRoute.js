const router = require("express").Router();
const authMiddleware = require("../../authMiddleware/authMiddleware");
const userControllers = require('../../controllers/userControllers')

//signup a new user
router.post("/signup",userControllers.postUserSignup);

//verify signup with OTP
router.post("/otp",userControllers.postUserOtp);

//login user
router.post("/login",userControllers.postUserLogin);

//checking the authorization of user
router.post("/getcurrentuser",authMiddleware,userControllers.getCurrentUser);

module.exports = router;
