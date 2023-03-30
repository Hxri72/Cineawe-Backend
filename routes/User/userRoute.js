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

router.get("/get-show-dates",userControllers.getShowDates)

router.post("/get-shows",userControllers.postGetShows)

router.post('/get-theater',userControllers.getTheater)

router.post('/get-create-order',userControllers.getCreateOrder)

router.post('/verify-payment',userControllers.postVerifyPayment)

module.exports = router;
