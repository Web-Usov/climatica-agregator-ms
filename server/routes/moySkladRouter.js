const express = require('express')
const router = express.Router()
const {msController} = require('../controllers')
const {checkAuth} = require('../middleware')


router.get('/getProduct', msController.getProduct  )
router.get('/getStock', msController.getStock  )
router.get('/getStore', msController.getStore  )
router.get('/createOrder', checkAuth, msController.createOrder)


module.exports = router