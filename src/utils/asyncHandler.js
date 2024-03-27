
/*  
    This is one way writing a asyncHandler function.
    asyncHandler function is accepting the function as an argument named requestHandler and it is being resolved using promises, the argumented function is resolved with three params if the resolve fails any error occurs it will go to catch part and show the error and then it will send the signal to move to the next part of the execution.
*/

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(responseHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}


/* Async Handler is a higher order function where it can take functions as parameter, it will accessed again. */


// const asyncHandler = ()
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async() => {}

/* Below function is accepting functions as argument, and that argumented function is executed in async function, async functions has four parameter (err, req, res, next), as we know earlier req and res are common but err and next are also present err is used to send the direct error message if we have something wrong in the receving request, next is parameter it will send to the middlewares that it has completed the task now go to the next middleware, if that is the last middleware then it become false and response will be sent. */

// THIS IS THE ONE OF WRITING THE ASYNCHANDLER FUNCTIONS

// const asyncHandler = (fn) => async(req, res, next) => {
//     try {
//         await fn(req, res, next) // executing the argumented function with three params
//     } 

//     /* There are multiple ways of sending the error message one is res.status either we send the error code (err.code) or default value 500. other way is to send the error response is that in the form of json with options of sucess its value will be false and message we can display the error message */

//     catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }