import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

/*
    Remember we are trying to logout the user by deleting the tokens from database and cookies, to have the access to tokens we are using request header sent by user and request which is two way communication provided by cookie-parser.

    Here we are handling the web request for that reason we need asyncHandler function, we are designing a middleware so we have another argument called next, this next is used to pass it next middleware if no middlewares are present then send this to response. this is use of next or middleware.

    from this middleware we have access to cookies in request and we sent the data in json also, so it tokens mighe be present in header of request which is sent by user, req.header(). header is a method it will take the argument "Authorization"
*/


export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
    
        if(!token){
            throw new ApiError(401, "Unauthorized access");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
} )