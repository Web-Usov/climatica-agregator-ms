const {auth} = require('../google_api/client')

module.exports = (req, res, next) => {
    try{
        
        console.log(req.originalUrl);
        auth({
            authUrl:req.query.authUrl,
            code:req.query.code
        }, (error, userData) => {
            if(error) {
                if(!req.query.authUrl){
                    return res.redirect('/gmail/auth?authUrl='+error.url)
                }
                return res.status(401).json(error)
            }
            req.userData = userData
            next();
        });
        
    }catch(e){        
        next({
            code:401,
            message:e,
        })
    }
}