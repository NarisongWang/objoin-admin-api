const express = require('express');
const { adminAuth } = require('../middlewares/requireAdminAuth');

const { 
    loadInstallationOrders,
    setupInstallationOrder,
    editInstallationOrder,
    deleteInstallationOrder,
    getInstallationOrders,
    getInstallationOrder,
    updateInstallationOrder,
    closeInstallationOrder
} = require('../controllers/installationOrderController');

const router = express.Router();

router.post('/admin/loadinstallationorders', adminAuth, loadInstallationOrders)
router.post('/admin/setupinstallationorder', adminAuth, setupInstallationOrder)
router.post('/admin/editinstallationorder', adminAuth, editInstallationOrder)
router.post('/admin/deleteinstallationorder', adminAuth, deleteInstallationOrder)
router.get('/admin/installationorders', adminAuth, getInstallationOrders)
router.route('/admin/installationorders/:id')
      .get(adminAuth, getInstallationOrder)
      .put(adminAuth, updateInstallationOrder)
router.post('/admin/closeorder', adminAuth, closeInstallationOrder)

module.exports = router;