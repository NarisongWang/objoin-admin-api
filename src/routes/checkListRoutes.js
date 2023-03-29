const express = require('express')
const router = express.Router()
const { getCheckList, updateCheckList} = require('../controllers/checkListController')
const { adminAuth } = require('../middlewares/requireAdminAuth')

router.get('/admin/getchecklist', adminAuth, getCheckList)
router.post('/admin/updatechecklist', adminAuth, updateCheckList)

module.exports = router