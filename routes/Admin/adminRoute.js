const router = require('express').Router()
const adminControllers = require('../../controllers/adminControllers')

//create a user
router.post('/admincreate',adminControllers.postAdminCreate)

router.post('/adminlogin',adminControllers.postAdminLogin)

router.get('/adminuser',adminControllers.getAdminUser)

router.get('/adminowner',adminControllers.getAdminOwner)

router.post('/block-user',adminControllers.postBlockUser)

router.post('/unblock-user',adminControllers.postUnblockUser)

module.exports = router