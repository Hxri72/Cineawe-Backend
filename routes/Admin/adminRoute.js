const router = require('express').Router()
const adminControllers = require('../../controllers/adminControllers')

//create a user
router.post('/admincreate',adminControllers.postAdminCreate)

router.post('/adminlogin',adminControllers.postAdminLogin)

router.get('/adminuser',adminControllers.getAdminUser)

router.get('/adminowner',adminControllers.getAdminOwner)

router.post('/block-user',adminControllers.postBlockUser)

router.post('/unblock-user',adminControllers.postUnblockUser)

router.post('/owner-status-change',adminControllers.postOwnerStatusChange)

router.get('/get-theaters',adminControllers.getTheaters)

router.get('/getAllBooking',adminControllers.getAllBooking)

router.post('/add-movies',adminControllers.postAddMovies)

router.get('/get-movies',adminControllers.getMovies)

router.post('/delete-movie',adminControllers.postDeleteMovie)

router.get('/get-dashboardData',adminControllers.getDashboardData)

module.exports = router