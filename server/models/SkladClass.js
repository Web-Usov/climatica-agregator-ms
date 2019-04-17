const {ms_client} = require('../moy_sklad')
const {Item, Products} = require('./')

class Sklad {
    constructor(props = {}){

    }
    // Product
    static async getProduct(props) {
        let products = await ms_client.GET('entity/product', props)    
        return products;
    }

    static async getProductById(id,props) {
        let product = await ms_client.GET('entity/product/' + id,props)
    
        return product;
    }

    static async getProductByHref(href,props) {
    
        let product = await ms_client.GET(href,props)
        
        return product;
    }    

    static async getProductFolder(props) {
        let p_folders = await ms_client.GET('entity/productfolder', props)
        return p_folders
    }
    
    // Store
    static async getStore(props) {
        let stores = await ms_client.GET('entity/store', props)    
        return stores
    }
    
    // Stock
    static async getStockByStore(props) {
        let stock = await ms_client.GET('report/stock/bystore', props)        
        return stock;
    }
    
    static async getStockAll(props){        
        let stock = await ms_client.GET('report/stock/all', props)
        
        return stock;
    }

    static async checkProductsInStore(productsArticle,storeName,props){

        
        const products = await this.getProduct({
            filter:{
                article:productsArticle
            }
        })
        if(products.rows.length <= 0) throw new Error(`E:SkladClass.checkProductsInStore -  один из товаров не найден "${productsArticle}"` )

        const store = await this.getStore({
            filter: {
                name:storeName
            }
        })
        
        if(store.rows.length <= 0) throw new Error(`E:SkladClass.checkProductsInStore -  не найден склад "${storeName}"` )
        const stock = await this.getStockAll({
            "store.id":store.rows[0].id,
            "product.id":products.rows.map(row => (row.id))
        })

        return stock;

    }

    static async toCorrectStock(stock = [], store = String.prototype){
        const correctStock = {
            store,
            type:"Stock",
            items:{}
        }

        for (let i = 0; i < stock.length; i++) {
            const item = stock[i];
            correctStock.items[item.article] = new Item({
                article:item.article,
                name:item.name,
                stock:item.stock,
                price:item.price
            })
        }
        return await new Products(correctStock)
    }
}

module.exports = Sklad