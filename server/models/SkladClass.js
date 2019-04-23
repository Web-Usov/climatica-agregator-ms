const { ms_client, ms } = require('../moy_sklad')
const { Item, Products } = require('./')

class Sklad {
    constructor(props = {}) {

    }

    // Products
    static async getProduct(props = {}) {
        let products = await ms_client.GET('entity/product', {
            limit: props.limit || 25,
            filter: props.filter || ""
        })
        return products;
    }

    static async getProductById(id, props) {
        let product = await ms_client.GET('entity/product/' + id, props)

        return product;
    }

    static async getProductByHref(href, props) {

        let product = await ms_client.GET(href, props)

        return product;
    }

    static async getProductFolder(props) {
        let p_folders = await ms_client.GET('entity/productfolder', props)
        return p_folders
    }

    static async checkProductsInStore(productsArticle, storeId) {
        const products = await this.getProduct({
            filter: {
                article: productsArticle
            }
        })
        if (products.rows.length <= 0) throw new Error(`E:SkladClass.checkProductsInStore -  один из товаров не найден "${productsArticle}"`)

        // const store = await this.getStoreById(storeId)

        // if (store.rows.length <= 0) throw new Error(`E:SkladClass.checkProductsInStore -  не найден склад "${storeName}"`)
        const stock = await this.getStock({
            // storeId: store.rows[0].id,
            storeId:storeId,
            productId: products.rows.map(row => (row.id))
        })
        if (stock.rows.length <= 0) throw new Error(`E:SkladClass.checkProductsInStore -  нет данных товаров "${productsArticle}" на складе "${storeName}" `)
        return stock;
    }

    static genListProducts(products){
        return products.map(item => ({
            price: item.price,
            quantity: item.quantity || 0,
            discount: item.discount || 0,
            vat: item.vat || 0,
            pack: item.pack,
            reserve: item.reserve || 0,
            assortment: {
                meta: item.meta
            }
        }))
    }

    // Store
    static async getStore(props) {
        let stores = await ms_client.GET('/entity/store', props)
        return stores
    }

    static async getStoreById(id = String.prototype) {
        const store = await ms_client.GET('/entity/store/' + id)
        return store
    }

    // Stock
    static async getStockByStore(props) {
        let stock = await ms_client.GET('report/stock/bystore', props)
        return stock;
    }

    static async getStock(props) {
        let stock = await ms_client.GET('report/stock/all', {
            "store.id": props.storeId,
            "product.id": props.productId
        })

        return stock;
    }

    static async toCorrectStock(stock = [], store = String.prototype) {
        const correctStock = {
            store,
            type: "Stock",
            items: {}
        }

        for (let i = 0; i < stock.length; i++) {
            const item = stock[i];
            correctStock.items[item.article] = new Item({
                article: item.article,
                name: item.name,
                stock: item.stock,
                price: item.price,
                meta: item.meta,
            })
        }
        return await new Products(correctStock)
    }

    // Organization
    static async getOrganization(props = {}) {

        const organizations = await ms_client.GET('/entity/organization', {
            limit: props.limit,
            filter: props.filter || ""
        })
        return organizations
    }

    static async getOrganizationById(id = String.prototype) {
        const organization = await ms_client.GET('/entity/organization/' + id)
        return organization
    }

    // Agent
    static async getAgent(props = {}) {
        const agetns = await ms_client.GET('/entity/counterparty', {
            limit: props.limit,
            filter: props.filter || "",
        })
        return agetns
    }

    static async getAgentById(id = String.prototype) {
        const agent = await ms_client.GET('/entity/counterparty/' + id)
        return agent
    }

    // Project

    static async getProjectById(id = String.prototype) {
        const project = await ms_client.GET('/entity/project/' + id)
        return project
    }

    // Order
    static async createCustomOrder(props = {}, products = []) {


        let customOrder = await ms_client.POST('/entity/customerorder', {
            name: props.name,
            organization: props.orgMeta,
            agent: props.agentMeta,
            store: props.storeMeta,
            project: props.projectMeta,
            applicable: props.applicable || false,
            vatEnabled: props.vatEnabled || true,
            moment: props.moment ? ms.getTimeString(props.moment, false) : ms.getTimeString(new Date(), false),
            deliveryPlannedMoment: props.deliveryMoment ? this.toDeliveryDate(props.deliveryMoment) : this.toDeliveryDate(new Date()),
            positions: this.genListProducts(products)
        })
        return customOrder
    }

    // InvoiceOut

    static async createInvoiceOutByOrder(customerOrder,products, props = {}) {
        const invoiceOut = await ms_client.POST("/entity/invoiceout", {
            customerOrder :{
                meta:customerOrder.meta
            },
            ...customerOrder,
            positions:this.genListProducts(products)
        })
        return invoiceOut
    }

    static async addOrderToInvoiceOut(invoiceOutId,customerOrder , props = {}){
        const adding = await ms_client.PUT('/entity/invoiceout/'+invoiceOutId,{
            customerOrder :{
                meta:customerOrder.meta
            }
        })
        return adding
    }

    //MetaData

    static async getMetaData(props){
        const metadata = await ms_client.GET('/entity/metadata/',{
            filter:props.filter || ""
        })

        return metadata
    }

    // Helpers
    static toDeliveryDate(date = Date.prototype) {
        date.setHours(16, 0, 0)
        date.setDate(date.getDate() + 1)
        const delivetyDate = ms.getTimeString(date, false)
        return delivetyDate
    }

    static toCorrectDate(date = Date.prototype){
        return ms.getTimeString(date, false)
    }

    
}

module.exports = Sklad