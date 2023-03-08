const express = require('express')
const { adminAuth } = require('../middlewares/requireAdminAuth');
const { getEmployees, getEmployee, getSalesOrders, getSalesOrder, getTotalCount } = require('../controllers/mssqlController')

const router = express.Router()
router.get('/mssql/employees', adminAuth, getEmployees)
router.get('/mssql/employees/:id', adminAuth, getEmployee)
router.post('/mssql/salesorders', adminAuth, getSalesOrders)
router.get('/mssql/salesorders/:id', adminAuth, getSalesOrder)
router.post('/mssql/countsalesorders', adminAuth, getTotalCount)

module.exports = router