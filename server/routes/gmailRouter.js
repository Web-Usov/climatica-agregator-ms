const express = require('express')
const router = express.Router()
const {messagesController,orderController} = require('../controllers')

const {checkAuth} = require('../middleware')

router.get('/messages/list',checkAuth,messagesController.getMessagesList  )
router.get('/messages/get',checkAuth, messagesController.getMessage)
router.get('/messages/getAttachments',checkAuth,messagesController.getMessageAttachments)
router.get('/messages/sendMessage', checkAuth, messagesController.sendEmail)

router.get('/order/getOrderFromFile',checkAuth,orderController.getOrderFromFile)
router.get('/order/getOrdersFromMessage',checkAuth,orderController.getOrderFromMessage)

router.get('/auth',checkAuth)

module.exports = router