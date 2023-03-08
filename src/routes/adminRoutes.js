const express = require('express')
const router = express.Router()
const { registerAdmin, loginAdmin, getAllUsers } = require('../controllers/adminController')
const { adminAuth } = require('../middlewares/requireAdminAuth')

router.get('/admin/getallusers', adminAuth, getAllUsers);
router.post('/admin/register', adminAuth, registerAdmin)
router.post('/admin/login', loginAdmin)

module.exports = router