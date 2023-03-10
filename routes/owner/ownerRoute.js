const router = require("express").Router();
const ownerControllers = require("../../controllers/ownerControllers");


router.get('/get-theaters',ownerControllers.getTheaters)

router.post('/get-theater-details',ownerControllers.getTheaterDetails)

router.post('/get-show-details',ownerControllers.getShowDetails)

router.post('/delete-show-details',ownerControllers.postDeleteShow)

router.post('/ownersignup',ownerControllers.postOwnerSignup)

router.post('/owner',ownerControllers.postOwnerLogin)

router.post('/add-theater',ownerControllers.postAddtheater)

router.post('/add-shows',ownerControllers.postAddShows)

router.post('/edit-theater-details',ownerControllers.postEditTheater)

router.post('/delete-theater',ownerControllers.postDeleteTheater)


module.exports = router