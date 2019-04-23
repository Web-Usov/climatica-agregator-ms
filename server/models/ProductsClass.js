const xlsx = require('xlsx');
const Item = require('./ItemClass')



class Products {
    constructor(props = {}) {

        this.items = props.items
        this.store = props.store || ""
        this.fileName = props.fileName || ""
        this.createDate = props.createDate || new Date()
        this.orderDate = props.orderDate || ""
        this.type = props.type || ""

    }

    static async genOrderFromXls(fileName) {
        const wb = xlsx.readFile(process.env.UPLOADS + "/" + fileName, {
            cellDates: true
        })
        const ws = wb.Sheets[wb.SheetNames[0]]

        const order = {
            items: {},
        }
        let index = 19;



        try {
            order.store = ws['C7'].v || ""
            order.fileName = fileName
            const date = new Date();
            date.setHours(date.getHours() + process.env.TIME_ZONE ||  4)
            order.createDate = date
            order.type = "Order"

            while (ws['A' + index]) {
                const item = {}
                if (ws['B' + index]) item.article = ws['B' + index].v
                if (ws['C' + index]) item.brand = ws['C' + index].v
                if (ws['D' + index]) item.name = ws['D' + index].v
                if (ws['E' + index]) item.count = ws['E' + index].v
                if (ws['F' + index]) item.price = ws['F' + index].v
                if (ws['G' + index]) item.orderDate = ws['G' + index].v

                const date = new Date(item.orderDate)
                date.setDate(date.getDate() + 1)
                item.orderDate = date

                // await order.list.push(item)
                order.items[item.article] = new Item(item)
                if(order.orderDate === undefined ) order.orderDate = item.orderDate;
                index++;
            }

        } catch (e) {
            console.log(e)
        }


        return await new Products(order)

    }

    static async correctXls(order = Products.prototype, fileName) {


        const wb = xlsx.readFile(process.env.UPLOADS + "/" + fileName, {
            cellDates: true,
            cellStyles: true
        })
        const ws = wb.Sheets[wb.SheetNames[0]]

        let index = 19;
        // console.log("PIP",ws['G' + index],order.items[ws['B' + index].v].orderDate);
        
        try {
            while (ws['A' + index]) {

                if (ws['B' + index]) {
                    const article = ws['B' + index].v
                    ws['E' + index].v = order.items[article].count                    
                    ws['G' + index].v = order.items[article].orderDate
                }

                index++;
            }

        } catch (e) {
            console.log(e);

        }
        const newWb = await xlsx.utils.book_new()
        await xlsx.utils.book_append_sheet(newWb, ws, wb.SheetNames[0])
        const newFileName = "correct_" + fileName
        await xlsx.writeFile(newWb, process.env.UPLOADS + "/" + newFileName)

        return newFileName
    }

    static  toCorrectOrder(order, correctStock ) {
        const correctOrder = Object.assign({},order)
        correctOrder.items = Object.assign({},correctOrder.items)
        for (const key in correctOrder.items) {
            
            if (correctOrder.items.hasOwnProperty(key) && correctStock.items.hasOwnProperty(key)) {
                correctOrder.items[key] = new Item({
                    ...correctOrder.items[key],
                    meta:correctStock.items[key].meta
                })
                if (correctStock.items[key].stock < correctOrder.items[key].count){
                    correctOrder.items[key] = new Item({
                        ...correctOrder.items[key],
                        count:correctStock.items[key].stock
                    })
                }
            }
        }
        return correctOrder;
    }
}

module.exports = Products;