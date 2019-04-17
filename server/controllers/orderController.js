const { Products, SendResponse, Message, File } = require('../models')


exports.getOrderFromFile = async (req, res, next) => {
    try {
        const order = await Products.genOrderFromXls(req.query.fileName)
        res.status(200).json(new SendResponse(req, "Agregator's order", order))
    } catch (e) {
        console.error("Error - controllers.getOrderFromFile: ", e);
        next(e)
    }
}

exports.getOrderFromMessage = async (req, res, next) => {
    try {
        const message = await Message.get(req.userData, req.query)
        const attachments = await  Message.getAttachments(req.userData, {
            message,
            ...req.query
        })
        const orders = [];
        for (let i = 0; i < attachments.length; i++) {
            const item = attachments[i]
            await File.bytesToFile(item)
            const order = await Products.genOrderFromXls(item.fileName)
            orders.push(order)
                
            await File.delete(item.fileName)
        }

        res.status(200).json(new SendResponse(req, "Agregator's orders from message", orders))

    } catch (e) {
        console.error("Error - controllers.getOrderFromMessage: ", e);
        next(e)
    }
}