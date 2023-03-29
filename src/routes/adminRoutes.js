const express = require('express')
const router = express.Router()
const { registerAdmin, loginAdmin, getAllUsers, activateUser, resendEmail } = require('../controllers/adminController')
const { adminAuth } = require('../middlewares/requireAdminAuth')

router.get('/admin/getallusers', adminAuth, getAllUsers);
router.post('/admin/register', adminAuth, registerAdmin)
router.post('/admin/activateuser', adminAuth, activateUser);
router.post('/admin/resendemail', adminAuth, resendEmail);
router.post('/admin/login', loginAdmin)

module.exports = router