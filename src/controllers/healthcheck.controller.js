import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (_, _) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const response = new ApiResponse("OK", "Healthcheck successful");

    if(!response){
        throw new ApiError(500, "Health Check Failed");
    }
})

export {
    healthcheck
    }
    