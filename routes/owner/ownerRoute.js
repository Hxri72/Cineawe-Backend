const router = require("express").Router();
const authMiddleware = require("../../authMiddleware/authMiddleware");
const ownerControllers = require("../../controllers/ownerControllers");

router.post('/getCurrentOwner',authMiddleware,ownerControllers.getCurrentOwner)

router.post('/get-theaters',ownerControllers.getTheaters)

router.post('/get-theater-details',ownerControllers.getTheaterDetails)

router.post('/get-show-details',ownerControllers.getShowDetails)

router.post('/delete-show-details',ownerControllers.postDeleteShow)

router.post('/ownersignup',ownerControllers.postOwnerSignup)

router.post('/owner',ownerControllers.postOwnerLogin)

router.post('/add-theater',ownerControllers.postAddtheater)

router.post('/add-shows',ownerControllers.postAddShows)

router.post('/edit-theater-details',ownerControllers.postEditTheater)

router.post('/delete-theater',ownerControllers.postDeleteTheater)

router.post('/owner-bookings',ownerControllers.postOwnerBookings)

router.post('/owner-dashboard-data',ownerControllers.postOwnerDashboard)

router.post('/owner-bookings-data',ownerControllers.postOwnerBookingsData)


module.exports = router