const router = require("express").Router();
const ownerControllers = require("../../controllers/ownerControllers");


router.get('/get-theaters',ownerControllers.getTheaters)

router.post('/ownersignup',ownerControllers.postOwnerSignup)

router.post('/owner',ownerControllers.postOwnerLogin)

router.post('/add-theater',ownerControllers.postAddtheater)


module.exports = router