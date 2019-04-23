const { SendResponse, MS, Message, File, Products } = require('../models')
const { toCorrectReq } = require('../utils')
const { entityId } = require('../moy_sklad')


exports.getProduct = async (req, res, next) => {
    try {
        const prod = await MS.getProduct(req.query)
        res.status(200).json(new SendResponse(req, "Products from MoySklad", prod.rows))
    } catch (e) {
        console.error("Error - msController.getProduct: ", e);
        next(e)
    }
}

exports.getStock = async (req, res, next) => {
    try {
        const prod = await MS.getStockAll(req.query)
        res.status(200).json(new SendResponse(req, "Stock's products from MoySklad", prod.rows))
    } catch (e) {
        console.error("Error - msController.getStockAll: ", e);
        next(e)
    }
}

exports.getStore = async (req, res, next) => {
    try {
        const prod = await MS.getStore(req.query)
        res.status(200).json(new SendResponse(req, "Store from MoySklad", prod.rows))
    } catch (e) {
        console.error("Error - msController.getStore: ", e);
        next(e)
    }
}

exports.createOrder = async (req, res, next) => {
    try {

        const correctReq = toCorrectReq({
            ...req.query,
            emailBody: req.body.email
        }, ["id"], [
                "emailSubject",
                "userId",
                "emailTo",
                "emailBody"
            ])

        const message = await Message.get(req.userData, correctReq)
        console.log("createOrder:   Message.get - OK");
        const attachments = await Message.getAttachments(req.userData, {
            message,
            ...correctReq
        })
        console.log("createOrder:  Message.getAttachments - OK");
        const attachment = attachments[0]
        await File.bytesToFile(attachment)
        console.log("createOrder:  File.bytesToFile - OK");

        const order = await Products.genOrderFromXls(attachment.fileName) || Products.prototype
        
        console.log("createOrder:  Products.genOrderFromXls - OK");

        const articles = []
        for (const key in order.items) {
            if (order.items.hasOwnProperty(key)) articles.push(key)
        }

        // 
        const metaStore = await MS.getMetaData({
            filter: {
                type: "store"
            }
        })
    
        const dopPole = await metaStore.store.attributes.find(x => (x.name == "armtek"))
    
        const { rows: stores } = await MS.getStore({
            filter: {
                [dopPole.meta.href]: order.store
            }
        })
        if(stores.length < 1) throw new Error(`createOrder:MS.getStore: Не найден склад с атрибутом ${dopPole.meta.href} = ${order.store}`)
        order.store = {
            name:stores[0].name,
            id:stores[0].id,
            meta:stores[0].meta
        }
        // 
        const stock = await MS.checkProductsInStore(articles, order.store.id)
        console.log("createOrder:  MS.checkProductsInStore - OK");

        const correctStock = await MS.toCorrectStock(stock.rows, order.store)
        console.log("createOrder:  MS.toCorrectStock - OK");
        delete stock;


        const correctOrder = Products.toCorrectOrder(order, correctStock)
        console.log("createOrder:  Products.toCorrectOrder - OK");
        // delete order;

        const newFileName = await Products.correctXls(correctOrder, attachment.fileName)
        console.log("createOrder:  Products.correctXls - OK");


        await createOrderMS(correctOrder)
        console.log("createOrder:  createOrderMS - OK");

        await Message.sendMessage(req.userData, {
            fileName: newFileName,
            to: correctReq.emailTo,
            body: correctReq.emailBody,
            subject: correctReq.emailSubject
        }, async (responseMessage) => {
            console.log("createOrder:  Message.sendMessage - OK");
            res.status(200).json(new SendResponse(req, `Проверка товаров и отправка заказа агрегатору из письма id:${message.id}, из файла fileName:${correctOrder.fileName} `, {
                order,
                correctOrder,
                correctStock,
                responseMessage
            }))
            console.log("createOrder:  res.status(200).json - OK");
            await File.delete(attachment.fileName)
            await File.delete(newFileName)
            console.log("createOrder:  File.delete - OK");

            

            


        })
    }
    catch (e) {
        console.error("Error - msController.checkProduct", e);
        next(e)
    }
}

const createOrderMS = async (order = Products.prototype,props = {}) => {

    const climatica = await MS.getOrganizationById(entityId.organization.id)
    console.log("=== climatica ===");
    const agent = await MS.getAgentById(entityId.agent.id)
    console.log("=== agent ===");

   
    const project = await MS.getProjectById(entityId.project.id)
    console.log("=== project ===");
   
    const positions = []
    for (const key in order.items) {
        if (order.items.hasOwnProperty(key)) {
            const x = order.items[key];
            positions.push({
                price: x.price*100,
                quantity: x.count,
                meta: x.meta
            })
        }
    }

    const customerOrder = await MS.createCustomOrder({
        name: "Заказ " + MS.toCorrectDate(order.createDate),
        agentMeta: { meta: agent.meta },
        orgMeta: { meta: climatica.meta },
        storeMeta: { meta: order.store.meta },
        projectMeta: { meta: project.meta },
        applicable: true,
        deliveryMoment:order.orderDate


    }, positions)

    console.log("=== customerOrder ===");

    const invoiceOut = await MS.createInvoiceOutByOrder(customerOrder, positions)

    console.log("=== invoiceOut ===");
}