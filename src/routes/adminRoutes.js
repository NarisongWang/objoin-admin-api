const express = require('express')
const router = express.Router()
const { registerAdmin, loginAdmin } = require('../controllers/adminController')
const { adminAuth } = require('../middlewares/requireAdminAuth')

router.post('/admin/register', adminAuth, registerAdmin)
router.post('/admin/login', loginAdmin)

module.exports = router