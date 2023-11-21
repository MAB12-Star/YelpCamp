class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statuscode = statusCode;
    }
}
module.exports = ExpressError;