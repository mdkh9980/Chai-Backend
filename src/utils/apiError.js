
/* 
    In this file we are handling the apiError, in node.js we have a class called Error, and we need to overwrite this error using the constructor, for overwriting some options we need super() and
    then overwriting data.

    Do some chatGPT and get whole idea behind this.

*/

class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        errors = [],
        stack
    ){
        super(message)
        this.statusCode = statusCode,
        this.data = null,
        this.message = message,
        this.success = false,
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}