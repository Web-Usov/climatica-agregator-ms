const { Message, SendResponse, File } = require('../models')
const fs = require('fs');
const { toCorrectReq } = require('../utils')


exports.getMessagesList = async (req, res, next) => {
    try {
        const correctReq = toCorrectReq(req.query, [], ["userId","q"])
        let list = await Message.getList(req.userData, correctReq).catch(err => { throw new Error(err) })

        res.status(200).json(new SendResponse(req, "Array with messages", list))
    } catch (e) {
        console.error("Error - controllers.getMessagesList: " + e);

        next(e)
    }
}

exports.getMessage = async (req, res, next) => {
    try {
        const correctReq = toCorrectReq(req.query, ["id"], ["userId", "q", "format"])
        const message = await Message.get(req.userData, correctReq)
        res.status(200).json(new SendResponse(req, "Message by id", message))
    } catch (e) {
        console.error("Error - controllers.getMessage: " + e);
        next(e)
    }
}

exports.getMessageAttachments = async (req, res, next) => {
    try {
        const message = await Message.get(req.userData, req.query)
        const attachments = await Message.getAttachments(req.userData, {
            message,
            ...req.query
        })

        if (req.query.download === '1') {

            for (let i = 0; i < attachments.length; i++) {
                const item = attachments[i]
                await File.bytesToFile(item)
                res.status(200).json(new SendResponse(req, "Message's attachments with download to server", attachments))
            }

        } else
            res.status(200).json(new SendResponse(req, "Message's attachments without download to server", attachments))
    } catch (e) {
        console.error("Error - Messagescontrollers.getMessageAttachments: " + e);
        next(e)
    }
}

exports.sendEmail = async (req, res, next) => {
    try {
        const correctReq = toCorrectReq({ ...req.query, body: req.body.email }, [], ["subject","userId", "from", "to", "fileName", "body"])
        await Message.sendMessage(req.userData, correctReq, data => {

            res.status(200).json(new SendResponse(req, "Send message", data))
        }) 

    } catch (error) {
        console.error("Error - Messagescontrollers.sendEmail: ", error);
        next(error)
    }
}