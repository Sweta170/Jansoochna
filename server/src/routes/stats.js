const express = require('express')
const router = express.Router()
const statsController = require('../controllers/statsController')
const { verifyAdmin } = require('../middleware/adminAuth')

router.use(verifyAdmin)

router.get('/overview', statsController.getOverview)
router.get('/categories', statsController.getCategories)

module.exports = router
