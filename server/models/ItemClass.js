module.exports = class Item {
    constructor(props = {}) {
        this.article = props.article
        this.brand = props.brand || ""
        this.name = props.name || ""
        this.count = props.count || 0
        this.stock = props.stock || 0
        this.price = props.price || 0
        this.orderDate = props.orderDate || ""
    }
}