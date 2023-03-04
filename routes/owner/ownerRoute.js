const router = require("express").Router();
const ownerControllers = require("../../controllers/ownerControllers");


router.post('/ownersignup',ownerControllers.postOwnerSignup)

router.post('/owner',ownerControllers.postOwnerLogin)


module.exports = router