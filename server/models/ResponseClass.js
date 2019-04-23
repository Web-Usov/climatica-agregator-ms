class SendResponse {
    constructor(req = Request.prototype, message = String.prototype , data = Object.prototype){
        this.requset = {
            method:req.method,
            url:req.originalUrl,
            queryParam:{
                ...req.query
            }
        }
        this.response = {
            message: message || "Response",
            data: data || null
        }
    }
}

module.exports = SendResponse