const router = require('express').Router()
const adminControllers = require('../../controllers/adminControllers')

//create a user
router.post('/admincreate',adminControllers.postAdminCreate)

router.post('/adminlogin',adminControllers.postAdminLogin)

router.get('/adminuser',adminControllers.getAdminUser)

router.get('/adminowner',adminControllers.getAdminOwner)

module.exports = router