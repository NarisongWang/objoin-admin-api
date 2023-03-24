const express = require('express');
const { adminAuth } = require('../middlewares/requireAdminAuth');

const { 
    createInstallationOrders,
    setupInstallationOrder,
    editInstallationOrder,
    deleteInstallationOrder,
    getInstallationOrders,
    getTotalCount,
    getInstallationOrder,
    updateInstallationOrder,
    closeInstallationOrder
} = require('../controllers/installationOrderController');

const router = express.Router();

router.post('/admin/createorders', adminAuth, createInstallationOrders)
router.post('/admin/setuporder', adminAuth, setupInstallationOrder)
router.post('/admin/editorder', adminAuth, editInstallationOrder)
router.post('/admin/installationorders', adminAuth, getInstallationOrders)
router.route('/admin/installationorders/:id')
      .get(adminAuth, getInstallationOrder)
      .put(adminAuth, updateInstallationOrder)
router.post('/admin/countorders', adminAuth, getTotalCount)
router.post('/admin/closeorder', adminAuth, closeInstallationOrder)
router.post('/admin/deleteorder', adminAuth, deleteInstallationOrder)

module.exports = router;